/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   lib/utils/flush.html
 */

/// <reference path="boot.d.ts" />

declare namespace Polymer {


  /**
   * Adds a `Polymer.Debouncer` to a list of globally flushable tasks.
   */
  function enqueueDebouncer(debouncer: Polymer.Debouncer): void;


  /**
   * Forces several classes of asynchronously queued tasks to flush:
   * - Debouncers added via `enqueueDebouncer`
   * - ShadyDOM distribution
   */
  function flush(): void;
}
