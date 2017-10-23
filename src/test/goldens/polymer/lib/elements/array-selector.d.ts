declare namespace Polymer {

  /**
   * Element implementing the `Polymer.ArraySelector` mixin, which records
   * dynamic associations between item paths in a master `items` array and a
   * `selected` array such that path changes to the master array (at the host)
   * element or elsewhere via data-binding) are correctly propagated to items
   * in the selected array and vice-versa.
   * 
   * The `items` property accepts an array of user data, and via the
   * `select(item)` and `deselect(item)` API, updates the `selected` property
   * which may be bound to other parts of the application, and any changes to
   * sub-fields of `selected` item(s) will be kept in sync with items in the
   * `items` array.  When `multi` is false, `selected` is a property
   * representing the last selected item.  When `multi` is true, `selected`
   * is an array of multiply selected items.
   * 
   * Example:
   * 
   * ```html
   * <dom-module id="employee-list">
   * 
   *   <template>
   * 
   *     <div> Employee list: </div>
   *     <template is="dom-repeat" id="employeeList" items="{{employees}}">
   *         <div>First name: <span>{{item.first}}</span></div>
   *         <div>Last name: <span>{{item.last}}</span></div>
   *         <button on-click="toggleSelection">Select</button>
   *     </template>
   * 
   *     <array-selector id="selector" items="{{employees}}" selected="{{selected}}" multi toggle></array-selector>
   * 
   *     <div> Selected employees: </div>
   *     <template is="dom-repeat" items="{{selected}}">
   *         <div>First name: <span>{{item.first}}</span></div>
   *         <div>Last name: <span>{{item.last}}</span></div>
   *     </template>
   * 
   *   </template>
   * 
   * </dom-module>
   * ```
   * 
   * ```js
   * Polymer({
   *   is: 'employee-list',
   *   ready() {
   *     this.employees = [
   *         {first: 'Bob', last: 'Smith'},
   *         {first: 'Sally', last: 'Johnson'},
   *         ...
   *     ];
   *   },
   *   toggleSelection(e) {
   *     let item = this.$.employeeList.itemForElement(e.target);
   *     this.$.selector.select(item);
   *   }
   * });
   * ```
   */
  class ArraySelector extends
    Polymer.ArraySelectorMixin(
    Polymer.Element) {
  }

  /**
   * Element mixin for recording dynamic associations between item paths in a
   * master `items` array and a `selected` array such that path changes to the
   * master array (at the host) element or elsewhere via data-binding) are
   * correctly propagated to items in the selected array and vice-versa.
   * 
   * The `items` property accepts an array of user data, and via the
   * `select(item)` and `deselect(item)` API, updates the `selected` property
   * which may be bound to other parts of the application, and any changes to
   * sub-fields of `selected` item(s) will be kept in sync with items in the
   * `items` array.  When `multi` is false, `selected` is a property
   * representing the last selected item.  When `multi` is true, `selected`
   * is an array of multiply selected items.
   */
  function ArraySelectorMixin<T extends new(...args: any[]) => {}>(base: T): {
    new(...args: any[]): {

      /**
       * An array containing items from which selection will be made.
       */
      items: any[]|null;

      /**
       * When `true`, multiple items may be selected at once (in this case,
       * `selected` is an array of currently selected items).  When `false`,
       * only one item may be selected at a time.
       */
      multi: boolean;

      /**
       * When `multi` is true, this is an array that contains any selected.
       * When `multi` is false, this is the currently selected item, or `null`
       * if no item is selected.
       */
      selected: Object|null|Object[]|null|null;

      /**
       * When `multi` is false, this is the currently selected item, or `null`
       * if no item is selected.
       */
      selectedItem: Object|null;

      /**
       * When `true`, calling `select` on an item that is already selected
       * will deselect the item.
       */
      toggle: boolean;
      __updateSelection(multi: any, itemsInfo: any): any;
      __applySplices(splices: any): any;
      __updateLinks(): any;

      /**
       * Clears the selection state.
       */
      clearSelection(): any;

      /**
       * Returns whether the item is currently selected.
       */
      isSelected(item: any): boolean;

      /**
       * Returns whether the item is currently selected.
       */
      isIndexSelected(idx: number): boolean;
      __deselectChangedIdx(idx: any): any;
      __selectedIndexForItemIndex(idx: any): any;

      /**
       * Deselects the given item if it is already selected.
       */
      deselect(item: any): any;

      /**
       * Deselects the given index if it is already selected.
       */
      deselectIndex(idx: number): any;

      /**
       * Selects the given item.  When `toggle` is true, this will automatically
       * deselect the item if already selected.
       */
      select(item: any): any;

      /**
       * Selects the given index.  When `toggle` is true, this will automatically
       * deselect the item if already selected.
       */
      selectIndex(idx: number): any;
    }
  } & T
}

interface HTMLElementTagNameMap {
  "array-selector": Polymer.ArraySelector;
}
