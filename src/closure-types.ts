/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */

// TODO Object<foo>, Object<foo, bar>
// TODO Record types
// TODO Function variadic parameters
//
// Useful resources for working on this package:
// https://eslint.org/doctrine/demo/
// https://github.com/google/closure-compiler/wiki/Types-in-the-Closure-Type-System

import * as doctrine from 'doctrine';

import * as ts from './ts-ast';

const {parseType, parseParamType} = require('doctrine/lib/typed.js');

/**
 * Convert from a type annotation in Closure syntax to a TypeScript type
 * expression AST (e.g `Array` => `Array<any>|null`).
 */
export function closureTypeToTypeScript(closureType: string): ts.Type {
  let ast;
  try {
    ast = parseType(closureType);
  } catch {
    return ts.anyType;
  }
  return convert(ast);
}

/**
 * Convert from a parameter type annotation in Closure syntax to a TypeScript
 * type expression AST
 * (e.g `Array=` => `{type: 'Array<any>|null', optional: true}`).
 */
export function closureParamToTypeScript(closureType: string):
    {optional: boolean, type: ts.Type} {
  let ast;
  try {
    ast = parseParamType(closureType);
  } catch {
    return {
      type: ts.anyType,
      // It's important we try to get optional right even if we can't parse
      // the annotation, because non-optional arguments can't follow optional
      // ones.
      optional: closureType.endsWith('='),
    };
  }
  const optional = ast.type === 'OptionalType';
  return {
    optional,
    type: convert(optional ? ast.expression : ast),
  };
}

/**
 * Format the given Closure type expression AST node as a TypeScript type
 * annotation string.
 */
function convert(node: doctrine.Type): ts.Type {
  let nullable;
  if (isNullable(node)) {  // ?foo
    nullable = true;
    node = node.expression;
  } else if (isNonNullable(node)) {  // !foo
    nullable = false;
    node = node.expression;
  } else {
    nullable = nullableByDefault(node);
  }

  let t: ts.Type;

  if (isParameterizedArray(node)) {  // Array<foo>
    t = convertArray(node);
  } else if (isUnion(node)) {  // foo|bar
    t = convertUnion(node);
  } else if (isFunction(node)) {  // function(foo): bar
    t = convertFunction(node);
  } else if (isBareArray(node)) {  // Array
    t = {kind: 'array', itemType: ts.anyType};
  } else if (isAllLiteral(node)) {  // *
    t = ts.anyType;
  } else if (isNullableLiteral(node)) {  // ?
    t = ts.anyType;
  } else if (isNullLiteral(node)) {  // null
    t = ts.nullType;
  } else if (isUndefinedLiteral(node)) {  // undefined
    t = ts.undefinedType;
  } else if (isName(node)) {  // string, Object, MyClass, etc.
    t = {kind: 'name', name: node.name};
  } else {
    console.error('Unknown syntax.');
    return ts.anyType;
  }

  if (nullable) {
    t = {kind: 'union', members: [t, ts.nullType]};
  }

  return t;
}

/**
 * Return whether the given AST node is an expression that is nullable by
 * default in the Closure type system.
 */
function nullableByDefault(node: doctrine.Type): boolean {
  if (isName(node)) {
    switch (node.name) {
      case 'string':
      case 'number':
      case 'boolean':
        return false
    }
    return true;
  }
  return isParameterizedArray(node);
}

function convertArray(node: doctrine.type.TypeApplication): ts.Type {
  const applications = node.applications;
  return {
    kind: 'array',
    itemType: applications.length === 1 ? convert(applications[0]) : ts.anyType,
  };
}

function convertUnion(node: doctrine.type.UnionType): ts.Type {
  if (node.elements.length === 1) {
    // `(string)` will be represented as a union of length one. Just flatten.
    return convert(node.elements[0]);
  }
  return {
    kind: 'union',
    members: node.elements.map(convert),
  };
}

function convertFunction(node: doctrine.type.FunctionType): ts.FunctionType {
  return {
    kind: 'function',
    params: node.params.map((param, idx) => {
      return {
        // TypeScript wants named parameters, but we don't have names.
        name: 'p' + idx,
        type: convert(param),
      };
    }),
    // Cast because typings are wrong: `FunctionType.result` is not an array.
    returns: node.result ? convert(node.result as any) : ts.anyType,
  };
}

function isParameterizedArray(node: doctrine.Type):
    node is doctrine.type.TypeApplication {
  return node.type === 'TypeApplication' &&
      node.expression.type === 'NameExpression' &&
      node.expression.name === 'Array';
}

function isBareArray(node: doctrine.Type):
    node is doctrine.type.TypeApplication {
  return node.type === 'NameExpression' && node.name === 'Array';
}

function isUnion(node: doctrine.Type): node is doctrine.type.UnionType {
  return node.type === 'UnionType';
}

function isFunction(node: doctrine.Type): node is doctrine.type.FunctionType {
  return node.type === 'FunctionType';
}

function isNullable(node: doctrine.Type): node is doctrine.type.NullableType {
  return node.type === 'NullableType';
}

function isNonNullable(node: doctrine.Type):
    node is doctrine.type.NonNullableType {
  return node.type === 'NonNullableType';
}

function isAllLiteral(node: doctrine.Type): node is doctrine.type.AllLiteral {
  return node.type === 'AllLiteral';
}

function isNullLiteral(node: doctrine.Type): node is doctrine.type.NullLiteral {
  return node.type === 'NullLiteral';
}

function isNullableLiteral(node: doctrine.Type):
    node is doctrine.type.NullableLiteral {
  return node.type === 'NullableLiteral';
}

function isUndefinedLiteral(node: doctrine.Type):
    node is doctrine.type.UndefinedLiteral {
  return node.type === 'UndefinedLiteral';
}

function isName(node: doctrine.Type): node is doctrine.type.NameExpression {
  return node.type === 'NameExpression';
}
