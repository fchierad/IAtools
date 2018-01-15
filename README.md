<a name="IAtools"></a>

## IAtools : <code>object</code>
# IAtoolsImport file to use in MicroFocus IDMAPPS module's forms.Current capabilities are to add a tabbed control inside an HTML control that emits events and callbacks per tab,as well as some functions to work with stand-alone picklists.Main files:* **IAtools.js**: Import file source code* **IAtools.min.js**: Minified version of the code* **IAtools.js**: Source map file for the minified version* **IAtools-test.xml**: example IDMAPPS (User Application/RBPM) workflow using this import.

**Kind**: global namespace  

* [IAtools](#IAtools) : <code>object</code>
    * [.tabCtrlFactory](#IAtools.tabCtrlFactory) : <code>object</code>
        * [~addTab(id, name, order, fieldlist, cb)](#IAtools.tabCtrlFactory..addTab) ⇒ <code>boolean</code>
        * [~removeTab(id)](#IAtools.tabCtrlFactory..removeTab) ⇒ <code>boolean</code>
        * [~setCSSClassName(type, name)](#IAtools.tabCtrlFactory..setCSSClassName) ⇒ <code>boolean</code>
        * [~setFieldEventName(fieldname, eventname)](#IAtools.tabCtrlFactory..setFieldEventName) ⇒ <code>boolean</code>
        * [~getSampleCSS()](#IAtools.tabCtrlFactory..getSampleCSS) ⇒ <code>text/html</code>
        * [~getTabHTML(uniqueID)](#IAtools.tabCtrlFactory..getTabHTML) ⇒ <code>text/html</code>
    * [.picklistFnFactory](#IAtools.picklistFnFactory) : <code>object</code>
        * [~PlFactory(selections, srcFieldName, destFieldName)](#IAtools.picklistFnFactory..PlFactory) ⇒ <code>boolean</code>
    * [.version()](#IAtools.version) ⇒ <code>string</code>
    * [.init(field, form, IDVault)](#IAtools.init)
    * [.fieldVisibility(event, field)](#IAtools.fieldVisibility) ⇒ <code>undefined</code>
    * [.readAllPicklistOptions(fldName)](#IAtools.readAllPicklistOptions) ⇒ <code>Object</code>

<a name="IAtools.tabCtrlFactory"></a>

### IAtools.tabCtrlFactory : <code>object</code>
IDMAPPS tab control sub-module.

**Kind**: static namespace of [<code>IAtools</code>](#IAtools)  
**Example**  
```js
var tabname = IAtools.tabCtrlFactory();
```

* [.tabCtrlFactory](#IAtools.tabCtrlFactory) : <code>object</code>
    * [~addTab(id, name, order, fieldlist, cb)](#IAtools.tabCtrlFactory..addTab) ⇒ <code>boolean</code>
    * [~removeTab(id)](#IAtools.tabCtrlFactory..removeTab) ⇒ <code>boolean</code>
    * [~setCSSClassName(type, name)](#IAtools.tabCtrlFactory..setCSSClassName) ⇒ <code>boolean</code>
    * [~setFieldEventName(fieldname, eventname)](#IAtools.tabCtrlFactory..setFieldEventName) ⇒ <code>boolean</code>
    * [~getSampleCSS()](#IAtools.tabCtrlFactory..getSampleCSS) ⇒ <code>text/html</code>
    * [~getTabHTML(uniqueID)](#IAtools.tabCtrlFactory..getTabHTML) ⇒ <code>text/html</code>

<a name="IAtools.tabCtrlFactory..addTab"></a>

#### tabCtrlFactory~addTab(id, name, order, fieldlist, cb) ⇒ <code>boolean</code>
Add tab to the internal storage. Underscore characters are NOT allowed as part of the ids since underscore will be used as a delimiter later.For order it is recommended to use large numbers to make it easier to insert new tabs in between any of the original ones without too much code changes/refactoring.

**Kind**: inner method of [<code>tabCtrlFactory</code>](#IAtools.tabCtrlFactory)  
**Returns**: <code>boolean</code> - true if successful, false if invalid parameters are received or tab already exists  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Internal tab id |
| name | <code>string</code> | Tab display name |
| order | <code>number</code> | Tab sorting order. Lower is left-most, higher is right-most. |
| fieldlist | <code>Array</code> | List of field(s) whose visibility and data are related to the added tab |
| cb | <code>function</code> | Callback used when the tabs change. Will be called as tabs change with a 2 parameters: tab internal ID and string parameter.                                When a tab becomes active the second parameter is 'enter', when it becomes inactive the second parameter is 'leave'. |

<a name="IAtools.tabCtrlFactory..removeTab"></a>

#### tabCtrlFactory~removeTab(id) ⇒ <code>boolean</code>
Removes tab from the internal storage.

**Kind**: inner method of [<code>tabCtrlFactory</code>](#IAtools.tabCtrlFactory)  
**Returns**: <code>boolean</code> - true if successful, false if invalid parameters are received or tab doesn't exist  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Internal tab id |

<a name="IAtools.tabCtrlFactory..setCSSClassName"></a>

#### tabCtrlFactory~setCSSClassName(type, name) ⇒ <code>boolean</code>
Allows to set the name of the CSS classes to be used when building the HTML code for the tabbed control

**Kind**: inner method of [<code>tabCtrlFactory</code>](#IAtools.tabCtrlFactory)  
**Returns**: <code>boolean</code> - true if successful, false if any issues occurred.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | which base class name to change. Options are 'navbar', 'navitem', 'navactive' |
| name | <code>string</code> | name of the CSS class to be applied when building the tabbed control |

<a name="IAtools.tabCtrlFactory..setFieldEventName"></a>

#### tabCtrlFactory~setFieldEventName(fieldname, eventname) ⇒ <code>boolean</code>
Set the name of the visibility events per field name so that the tabbed control can show/hide the appropriated fields

**Kind**: inner method of [<code>tabCtrlFactory</code>](#IAtools.tabCtrlFactory)  
**Returns**: <code>boolean</code> - true if successful, false if any issues occurred.  

| Param | Type | Description |
| --- | --- | --- |
| fieldname | <code>string</code> | Name of the field (in Designer, not Web UI) |
| eventname | <code>string</code> | Name of the visibility event to be called for show/hide |

<a name="IAtools.tabCtrlFactory..getSampleCSS"></a>

#### tabCtrlFactory~getSampleCSS() ⇒ <code>text/html</code>
Sample CSS style for the tabbed control to demonstrate its usage.

**Kind**: inner method of [<code>tabCtrlFactory</code>](#IAtools.tabCtrlFactory)  
**Returns**: <code>text/html</code> - Style HTML tag with working basic style for the HTML tabbed control  
<a name="IAtools.tabCtrlFactory..getTabHTML"></a>

#### tabCtrlFactory~getTabHTML(uniqueID) ⇒ <code>text/html</code>
Builds and returns the HTML code to be set on an IDMAPPS string/HTML form field.

**Kind**: inner method of [<code>tabCtrlFactory</code>](#IAtools.tabCtrlFactory)  
**Returns**: <code>text/html</code> - Style HTML tag with working HTML tabs  

| Param | Type | Description |
| --- | --- | --- |
| uniqueID | <code>string</code> | Unique ID set at the UL element of the tabbed interface |

<a name="IAtools.picklistFnFactory"></a>

### IAtools.picklistFnFactory : <code>object</code>
Builds functions to manage items on picklist control.Allows developer to define functions that copy or move items between picklists,as well as ones that remove items from picklists. Allows to specify sorting and pass ina custom sorting function to be used by the picklist management function generated.

**Kind**: static namespace of [<code>IAtools</code>](#IAtools)  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | Valid options are "add", "move" or "remove". Choose the basic functionality of the returned function.                              add -> Add the selections passed to the destination field;                              move -> Remove the selections passed from the Source field and add them to the destination field;                              remove -> Removes the selections passed from the Source Field. Destination field is not used with this action.                               If a item already exists in the destination field, code will highlight that entry instead of adding a second copy. |
| sort | <code>boolean</code> | (Optional) true will sort the values for both source and destination fields. Defaults to false if not provided. |
| sortfn | <code>string</code> | (Optional) if sort equals true, custom sort function to be used to sort the fields.                             Both source and destination fields are sorted with the same function |

**Example**  
```js
var addToPicklist = IAtools.picklistFnFactory( "add" );
```
**Example**  
```js
var moveToPicklistWithSort = IAtools.picklistFnFactory( "move", true );
```
**Example**  
```js
var removeCustomSort = IAtools.picklistFnFactory( "remove", true, function(a, b) { return a - b; } );
```
<a name="IAtools.picklistFnFactory..PlFactory"></a>

#### picklistFnFactory~PlFactory(selections, srcFieldName, destFieldName) ⇒ <code>boolean</code>
Returned Function that performs picklist management as per parameters passed to picklistFnFactory.

**Kind**: inner method of [<code>picklistFnFactory</code>](#IAtools.picklistFnFactory)  
**Returns**: <code>boolean</code> - false if validation of parameters or task failed, true otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| selections | <code>string/array</code> | String or Array with values to be moved from source to destination field |
| srcFieldName | <code>string</code> | Name of the source field being read/modified |
| destFieldName | <code>string</code> | Name of the destination field being read/modified |

<a name="IAtools.version"></a>

### IAtools.version() ⇒ <code>string</code>
Module version and requirements

**Kind**: static method of [<code>IAtools</code>](#IAtools)  
**Returns**: <code>string</code> - Module's version  
<a name="IAtools.init"></a>

### IAtools.init(field, form, IDVault)
Initializes references to the IDMAPPs framework objects and save the same in the internal storage

**Kind**: static method of [<code>IAtools</code>](#IAtools)  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>object</code> | IDMAPPS framework field object |
| form | <code>object</code> | IDMAPPS framework form object |
| IDVault | <code>object</code> | IDMAPPS framework IDVault object |

<a name="IAtools.fieldVisibility"></a>

### IAtools.fieldVisibility(event, field) ⇒ <code>undefined</code>
When added in the event section of a form field, allow us to show and hide that field by using field.fireEvent( event-name, action );Where event-name is the event's name and action is either 'show' or 'hide'Since the field visibility functions only exist inside the field context we need to pass both objects from wherethe function is being called to use them inside that scope/context. Inside the event we just need to add the line:IAtools.fieldVisibility( event, field );to properly use this function. No need to change anything on the line above, it is already passing the event and field objectsas seen in the scope of that particular form field.

**Kind**: static method of [<code>IAtools</code>](#IAtools)  
**Returns**: <code>undefined</code> - Changes the field visibility, no return value provided.  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>object</code> | event object as seen by the field's scope |
| field | <code>object</code> | field  object as seen by the field's scope |

<a name="IAtools.readAllPicklistOptions"></a>

### IAtools.readAllPicklistOptions(fldName) ⇒ <code>Object</code>
Reads a picklist field in RBPM and retrieves all its values/options. This is necessary since the RBPM standard API only lets us retrieve selected values, not the whole list of available ones.

**Kind**: static method of [<code>IAtools</code>](#IAtools)  
**Returns**: <code>Object</code> - Returns an object with the format { 'data':[ picklist data ], 'display':[ picklist display values ] }  

| Param | Type | Description |
| --- | --- | --- |
| fldName | <code>string</code> | Name of the picklist control field as displayed in Designer. |

