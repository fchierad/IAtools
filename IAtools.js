// IAtools module. Support utilities for User App/RBPM/IDMAPPS forms

var IAtools = ( function iatools () {
	// Store's library's own name
	var libname = 'IAtools';
	// Exports module's methods
	var PublicAPI = {
		init:init,
		version:version,
		fieldVisibility:fieldVisibility,
		tabCtrlFactory:tabCtrlFactory,
		readAllPicklistOptions:readAllPicklistOptions,
		picklistFnFactory:picklistFnFactory,
	};
	var idmapps = {}; // Stores the IDMAPPS framework objects
	
	// module version and requirements
	function version()
	{
		var o = {
			version:'0.0.2',
			requires:'no other modules at the moment'
		};
		return o.version;
	}

	/**
	 * Initializes references to the IDMAPPs objects and save the same in the internal storage
	 */
	function init( field, form, IDVault ) {
		// Only appends the parameters passed so that we can check for the link's existence
		// before using it in the functions that require the User App/RBPM/IDMAPPS framework
		if ( field != null ) {
			idmapps.field = field;
		}
		if ( form != null ) {
			idmapps.form = form;
		}
		if ( IDVault != null ) {
			idmapps.IDVault = IDVault;
		}
	}

		/**
	 * When added in the event section of a form field, allow us to show and hide that field by using 
	 * field.fireEvent( event-name, action );
	 * Wheve event-name is the event's name and action is either 'show' or 'hide'
	 * 
	 * Since the field visibility functions only exist inside the field context we need to pass both objects from where
	 * the function is being called to use them inside that scope/context. Inside the event we just need to add the line:
	 * IAtools.fieldVisibility( event, field );
	 * to properly use this function. No need to change anything on the line above, it is already passing the event and field objects
	 * as seen in the scope of that particular form field.
	 * 
	 * @param {object}  event	event object as seen by the field's scope
	 * @param {object}  field	field  object as seen by the field's scope
	 *
	 * @return {undefined} 	Changes the field visibility, no return value provided.
	 */
	function fieldVisibility( event, field ) {
		var action = String( event.getCustomData() );
		switch ( action.toLowerCase() ) {
			case 'show':
				field.show();
				break;
			case 'hide':
				field.hide();
				break;
			default:
			console.log( 'Field: ' + field.getLabel() + ', Event: ' + event.getEventName() + ', Invalid option received: ' + action );
		}
	}
	/**
	 * Reads a picklist field in RBPM and retrieves all its values/options. This is necessary since 
	 * the RBPM standard API only lets us retrieve selected values, not the whole list of available ones.
	 *
	* @param {string}	fldName		Name of the picklist control field as displayed in Designer.

	* @return {Object}	Returns an object with the format { 'data':[ picklist data ], 'display':[ picklist display values ] }
	*/

	function readAllPicklistOptions( fldName ) {
	var ret = { data:[], display:[] };
	var selfld, selopt, rbpmID;
	// input check
	if ( fldName == null || fldName == '' || typeof fldName !== 'string' ) {
		console.log( 'readAllPicklistOptions: invalid parameter passed. Please pass a string with the field\'s name as it appears in Designer' );
		return ret;
	}
	// Try to retrieve the field.
	rbpmID = '_' + fldName;
	selfld = document.getElementById( rbpmID );
	// Validate if we found it or need to issue an error.		
	if ( selfld != null && selfld.id === rbpmID ) {
		if ( String( selfld.tagName ).toLowerCase() == 'select' ) {
			// Try to find the option element
			selopt = selfld.getElementsByTagName( 'option' );	
		} else {
			console.log( 'readAllPicklistOptions: Field ' + fldName + ' is not a picklist. Element found was: ' + selfld.tagName );
		}
	} else {
		console.log( 'readAllPicklistOptions: could not find field ' + fldName + ' on this current form.' );
	}
	// Check if the option element was found. If not skips processing
	if ( selopt != null && selopt.length > 0 ) {
		// Parses the data and display values, saves them to value and display
		for ( var i=0; i < selopt.length; i++ ) {
			if ( selopt[ i ].getAttribute( 'value' ) != null && selopt[ i ].getAttribute( 'value' ).length > 0 && 
				selopt[ i ].textContent != null && selopt[ i ].textContent.length > 0 ) {
				ret.data.push( selopt[ i ].getAttribute( 'value' ) );
				ret.display.push( selopt[ i ].textContent );
			}
		}
	}

	return ret;
	}

	/**
	 * Wrapped all HTML Tabbed control functions into a sub-module so that we can instantiate multiple controls in the same RBPM form
	 * Usage: 
	 * 		var tabname = IAtools.tabCtrlFactory();
	 */
	function tabCtrlFactory() {
		var tabPublicAPI = {
			addTab:addTab,
			removeTab:removeTab,
			setCSSClassName:setCSSClassName,
			setFieldEventName:setFieldEventName,
			getSampleCSS:getSampleCSS,
			getTabHTML:getTabHTML,
		};
		var tabs = {};	// Store tab id and internal values. 
										//format: {id1:{name:'', order:#, fieldlist:[], callback:fn},id2:{name:'', order:#, fieldlist:[],callback:fn}}
		var cssClasses = { // Used when building the ul/li tabs HTML. Created with default values to be overridden
			navbar:'cc-navbar',
			navitem:'cc-navitem',
			navactive:'cc-navactive'
		};
		var fieldevents = {}; // Store field names and events. format: {fieldname:eventname}. Used to call with show/hide for the fields
	
		/**
		 * Add tab to the internal storage. Underscore characters are NOT allowed as part of the ids 
		 * since underscore will be used as a delimiter later.
		 * For order it is recommended to use large numbers to make it easier to insert new tabs in between 
		 * any of the original ones without too much code changes/refactoring.
		 * 
		 * @param {string}    id         Internal tab id
		 * @param {string}    name       Tab display name
		 * @param {number}    order      Tab sorting order. Lower is left-most, higher is right-most.
		 * @param {Array}     fieldlist  List of field(s) whose visibility and data are related to the added tab
		 * @param {function}  cb         Callback used when the tabs change. Will called as tabs change with a 2 parameters: tab internal ID and string parameter. 
		 *                               When a tab becomes active the second parameter is 'enter', when it becomes inactive the second parameter is 'leave'.
		 * 
		 * @return {boolean}  true if successful, false if invalid parameters are received or tab already exists
		 */
		function addTab( id, name, order, fieldlist, cb ) {
			// input parameter validation
			if ( id == null || id === '' || name == null || order == null || fieldlist == null ) {
				return false;
			}
			if ( ! ( fieldlist instanceof Array ) ) {
				if ( typeof fieldlist === 'string') {
					fieldlist = [ fieldlist ]; // Normalizes single field into Array for easier processing
				} else {
					return false;
				}
			}
			id = id.replace( /_/g, '' ); // Clears underscores since we use them as delimiters internally
			// Append to list only if not present
			if ( ! tabs[ id ] ){
				tabs[ id ] = { name:String( name ), order:Number( order ), fieldlist:fieldlist };
				if ( typeof cb === 'function' ) {
					tabs[ id ].callback = cb;
				}
			}	else {
				return false;
			}
			return true;
		}
	
		/**
		 * Removes tab from the internal storage. 
		 * 
		 * @param {string}  id  Internal tab id
		 * 
		 * @return {boolean}  true if successful, false if invalid parameters are received or tab doesn't exist
		 */
		function removeTab( id ) {
			// input parameter validation
			if ( id == null || id === '' ) {
				return false;
			}
			id = id.replace( /_/g, '' ); // Clears underscores since we use them as delimiters internally	
			if ( ! tabs[ id ] ){
				return false;
			}
			return delete tabs[ id ];
		}
	
		/**
		 * Allows to set the name of the CSS classes to be used when building the HTML code for the tabbed control
		 * 
		 * @param {string}  type  which base class name to change. Options are 'navbar', 'navitem', 'navactive'
		 * @param {string}  name  name of the CSS class to be applied when building the tabbed control
		 * 
		 * @return {boolean}  true if successful, false if any issues occurred.
		 */
		function setCSSClassName( type, name ) {
			if ( type == null || name == null ) {
				return false;
			}
			if ( cssClasses.hasOwnProperty( type ) ) {
				cssClasses[ type ] = name;
			} else {
				return false;
			}
			return true;
		}
	
		/**
		 * Set the name of the visibility events per field name so that the tabbed control can show/hide the appropriated fields
		 * 
		 * @param {string}  fieldname  Name of the field (in Designer, not Web UI) 
		 * @param {string}  eventname  Name of the visibility event to be called for show/hide
		 * 
		 * @return {boolean}  true if successful, false if any issues occurred.
		 */
		function setFieldEventName( fieldname, eventname ) {
			if ( fieldname == null || eventname == null ) {
				return false;
			}
			fieldevents[ String( fieldname ) ] = String( eventname );
			return true;
		}
	
		/**
		 * Sample CSS style for the tabbed control to demonstrate its usage.
		 * 
		 * @return {text/html} Style HTML tag with working basic style for the HTML tabbed control
		 */
		function getSampleCSS() {
			var xhtml = '<style>' +
			'.' + cssClasses.navbar + '{list-style-type:none;margin:0;padding:0;overflow:hidden}' +
			'.' + cssClasses.navbar + ' li{float:left}.' + cssClasses.navbar + ' li a {display:block;padding:8px 16px}'+
			'.' + cssClasses.navitem + '{color:#000000;background-color:#E3E1DC;border-top-left-radius:16px;border-top-right-radius:6px}' +
			'.' + cssClasses.navbar + ' li a:hover{color:#ED7420;backgroung-color:#B0A9A1}' +
			'.' + cssClasses.navactive + '{color:#00BCE7;background-color:#484B4D;border-top-left-radius:16px;border-top-right-radius:6px}' +
			'a.' + cssClasses.navactive + '{color:#00BCE7;background-color:#484B4D;border-top-left-radius:16px;border-top-right-radius:6px}' +
			'</style>';
			return xhtml;
		}
	
		/**
		 * Builds and returns the HTML code to be set on an IDMAPPS string/HTML form field.
		 * 
		 * @param {string}  uniqueID  Unique ID set at the UL element of the tabbed interface
		 * 
		 * @return {text/html} Style HTML tag with working HTML tabs
		 */
		function getTabHTML( uniqueID, postSelectedFn ) {
			if ( uniqueID == null ) {
				return false;
			}
			var activateTabFnName = exportActivateTabFn( uniqueID );
			var xhtml, tabsSorted, firstrun;
			// top level element
			xhtml = '<ul id="' + uniqueID + '" class="' + cssClasses.navbar + '">';
			// Build tabs on the order defined by the tab's "order" numeric value, left to right
			tabsSorted = Object.keys( tabs ).sort( function( a,b ) { 
				return tabs[ a ].order - tabs[ b ].order; 
			});
			firstrun = true; // First tab get the navactive class, others do not. ctrl controls that
			tabsSorted.forEach( function buildTabHTML( tab ) {
				var tabid = uniqueID + '_' + tab;
				var evtcode = activateTabFnName + "( event, '" + tabid + "' )";
				var csslist;
				// Handle tab field visibility and css classes as we build the HTML for the tabbed control
				if ( firstrun ) {
					csslist = cssClasses.navitem + ' ' + cssClasses.navactive;
					switchTabFieldsVisibility( tabid, 'show' );
					firstrun = false;
				} else {
					csslist = cssClasses.navitem;
					switchTabFieldsVisibility( tabid, 'hide' );
				}
				// Build the tab li HTML
				xhtml += '<li><a href="javascript:void(0)" ' +
					'id="' + tabid + '" class="' + csslist + '" onclick="' + evtcode + '">' + 
					tabs[ tab ].name + '</a></li>';
			});
			// Close top level element
			xhtml += '</ul>';
			
			return xhtml;
		}

		/**
		 * Switches the tab that has the CSS class for navactive.
		 * 
		 * @param {string}  evt       The event object from the browser action 
		 * @param {string}  uniqueID  Unique ID set at the UL element of the tabbed interface
		 * @param {string}  tabID     Individual tab's ID value, usually uniqueID + '_' + tab.id . both are first stripped of all _ characters.
		 * 
		 * @return {boolean}  true if successful, false if any issues occurred.
		 */
		function activateTab( evt, tabID ) {
			if ( evt == null || tabID == null ) {
				return false;
			}
			var uniqueID = tabID.split( /_/ )[ 0 ];
			var topUL = document.getElementById( uniqueID );
			var i, toclear;
			if ( topUL ) {
				toclear = topUL.getElementsByClassName( cssClasses.navitem );
				for ( i = 0; i < toclear.length; i++ ) {
					if ( toclear[ i ].className.indexOf( cssClasses.navactive ) !== -1 ) {
						toclear[ i ].className = toclear[ i ].className.replace( cssClasses.navactive, '' ).replace( /\s+/g, ' ' );
						switchTabFieldsVisibility( toclear[ i ].id, 'hide' );
					}
				}
				evt.currentTarget.className = evt.currentTarget.className.replace( /\s+$/g, '' ) + ' ' + cssClasses.navactive;
				switchTabFieldsVisibility( evt.currentTarget.id, 'show' );
			} else {
				return false;
			}
			return true;
		}

		/**
		 * Emit events to perform the action (show or hide) on all form fields mapped to the tabID
		 * 
		 * @param {string}  tabID   Tab id to be parsed and used to determine which fields to act upon
		 * @param {string}  action  'show' or 'hide', no other action is accepted
		 * 
		 * @return {boolean}  true if successful, false if any issues occurred.
		 */
		function switchTabFieldsVisibility( tabID, action ) {
			if( ! idmapps.hasOwnProperty( 'field' ) ) {
				return false;
			}
			if ( tabID == null || ( action !== 'show' && action !== 'hide' ) ) {
				return false;
			}
			// Retrieving the tab.id values from the HTML element's unique ID.
			var tab = tabID.split( /_/ )[ 1 ];
			var state = { // Value passed to the callback as tabs switch, cre
				show:'enter',
				hide:'leave'
			};
			// Parse list of fields to retrieve the visibility events and issue the show/hide action as called.
			if ( tabs.hasOwnProperty( tab ) && tabs[ tab ].hasOwnProperty( 'fieldlist' ) && tabs[ tab ].fieldlist instanceof Array ) {
				tabs[ tab ].fieldlist.forEach( function render( fldname ) {
					var evtname;
					if ( fieldevents.hasOwnProperty( fldname ) ) {
						evtname = fieldevents[ fldname ];
						idmapps.field.fireEvent( evtname, action );
					}
					// If a callback was provided when defining the tab, call it with a parameter
					if ( tabs[ tab ].hasOwnProperty( 'callback' ) ) {
						tabs[ tab ].callback( tab, state[ action ] );
					}
				});
			}
			return true;
		}

		/**
		 * To make life simpler, links the internal activateTab to a custom name based off of 
		 * the HTML element's unique ID
		 * 
		 * @param {string} uniqueID  Used as part of the export name, making easier to tie 
		 *                           the dynamic function back to the HTML element it corresponds to
		 * 
		 * @return {string}  Name of the link to the internal activateTab to be used by the control
		 */
		function exportActivateTabFn( uniqueID ) {
			var fnname;
			var name = String( uniqueID ) + 'activateTab';
			if ( ! window[ libname ] ) {
				window[ libname ] = {};
			}
			if ( ! window[ libname ].dynamic ) {
				window[ libname ].dynamic = {};
			}
			window[ libname ].dynamic[ name ] = activateTab;
			fnname = libname + '.dynamic.' + name;
			return fnname;
		}

		return tabPublicAPI;
	}

	/** 
 * Returns a function with specific behaviors based on the parameters passed in. 
 *  @param {string}     action  Valid options are "add", "move" or "remove". Choose the basic functionality of the returned function.
 *  @param {boolean}    sort    (Optional) true will sort the values for both source and destination fields. Defaults to false if not provided.
 *  @param {string}     sortfn  (Optional) if sort equals true, custom sort function to be used to sort the fields.
 *                              Both source and destination fields are sorted with the same function
 */
	function picklistFnFactory( action, sort, sortfn ) {
		/**
		 * The returned function will behave differently based on the action value.
		 * 
		 * Action:
		 * add -> Add the selections passed to the destination field
		 * move -> Remove the selections passed from the Source field and add them to the destination field
		 * remove -> Removes the selections passed from the Source Field. Destination field is not used with this action
		 * 
		 * If a item already exists in the destination field, code will highlight that entry instead of adding a second copy.
		 * 
		 * @param {string/array}  selections     String or Array with values to be moved from source to destination field
		 * @param {string}        srcFieldName   Name of the source field being read/modified
		 * @param {string}        destFieldName  Name of the destination field being read/modified
		 *
		 * @return {boolean}  false if validation of paratemers or task failed, true otherwise.
		 */ 
		return function PlFactory( selections, srcFieldName, destFieldName ) {
			// Variables section
			var fieldstate = {}; // Stores field states internally
			var srcFld = { 'data':[], 'display':[] }; // Values read from destination field
			var desFld = { 'data':[], 'display':[] }; // Values read from destination field
			var redrawfld = false; // Controls if we just highligh parts or redraw the whole field with new values
			var value = []; // Used when calling the framework function to set the picklist selection values
			var display = []; // Used when calling the framework function to set the picklist display values
			var hlsel = []; // Values to be highlighted
			var chksrcFld = ''; // -1 if not found, Array index if found
			var chkdesFld = ''; // -1 if not found, Array index if found
			// Input parameter validation
			var inputValid = true;
				if ( selections == null || selections == '' || selections.length < 1 ) {
					inputValid = false;
					console.log( 'Need a selection to act upon' );
				}
				if ( srcFieldName == null || srcFieldName == '' ) {
					inputValid = false;
					console.log( 'srcFieldName not provided' );
				}
				// remove action does not use the destination field
				if ( action !== 'remove' && ( destFieldName == null || destFieldName == '' ) ) {
					inputValid = false;
					console.log( 'destFieldName not provided' );
				}
				if ( ! inputValid ) {
					return false;
				}
				// Normalize input to simplify the logic down the path
				if ( !( selections instanceof Array ) ) { selections = [ selections ]; }
				// Read data from both fields
				srcFld = readAllPicklistOptions( srcFieldName );
				fieldstate[ srcFieldName ] = { // Stores current field's state on the module by copy
					'data':    srcFld.data.slice(),
					'display': srcFld.display.slice()
				};
				if ( action !== 'remove' ) { // remove action does not use the destination field
					desFld = readAllPicklistOptions( destFieldName );
					fieldstate[ destFieldName ] = { // Stores current field's state on the module by copy
						'data':    desFld.data.slice(),
						'display': desFld.display.slice()
					};
				}
				/* Check if the value is already on the selection and if it isn't, 
				 * removes the value from the search results and adds it to the selection
				 */
				selections.forEach( function iterator( selection ) {
					chksrcFld = fieldstate[ srcFieldName ].data.indexOf( selection );
					if ( chksrcFld === -1 ) { //  This should never happen. Safeguarding against it regardless
						return;
					}
					if ( action !== 'add' ) { // Add action preserves the values in the original field
						// Remove value from current search results
						fieldstate[ srcFieldName ].data.splice( chksrcFld, 1 );
						fieldstate[ srcFieldName ].display.splice( chksrcFld, 1 );
						// Set flag to cause field redraw at the end
						redrawfld = true;
					}
					if ( action === 'remove' ) { // remove action does not use the destination field
						return;
					}
					// If we got here it is an add or a move, treating destination field 
					chkdesFld = fieldstate[ destFieldName ].data.indexOf( selection );
					if ( chkdesFld === -1 ) {
						// Adding value to the Destination Field
						fieldstate[ destFieldName ].data.push( srcFld.data[ chksrcFld ] );
						fieldstate[ destFieldName ].display.push( srcFld.display[ chksrcFld ] );
						// Set flag to cause field redraw at the end
						redrawfld = true;                                        
					} else {
						// Setup  to highlight already existing value
						hlsel.push( desFld.data[ chkdesFld ] );
						redrawfld = true;      
					}
					return;
				});
				// Refresh the contents for the field(s) as needed
				if ( redrawfld ) {
					// SOURCE FIELD - All 3 actions affect source field, treating that here
					value = fieldstate[ srcFieldName ].data; // Array passed by  reference, sorting will affect the fieldstate one as well
					display = [];
					// Handles sorting of the resulting field
					if ( sort ) {
						if ( typeof sortfn === 'function' )
						{
							value.sort( sortfn );
						} else {
							value.sort();
						}
						value.forEach( function buildDisplay( item ) {
							var idx = srcFld.data.indexOf( item );
							display.push( srcFld.display[ idx ] );
						});
						fieldstate[ srcFieldName ].display = display; // update internal storage space
					} else {
						display = fieldstate[ srcFieldName ].display;
					}
					idmapps.form.setValues( srcFieldName, value, display );
					// DESTINATION FIELD - remove action does not use the destination field
					if ( action !== 'remove' ) {
						value = fieldstate[ destFieldName ].data.slice();
						display = [];
						// Handles sorting of the resulting field
						if ( sort ) {
							if ( typeof sortfn === 'function' )
							{
								value.sort( sortfn );
							} else {
								value.sort();
							}
							value.forEach( function buildDisplay( item ) {
								var idx = fieldstate[ destFieldName ].data.indexOf( item );
								display.push( fieldstate[ destFieldName ].display[ idx ] );
							});
							fieldstate[ destFieldName ].data = value.slice(); // update internal storage post sorting
							fieldstate[ destFieldName ].display = display.slice(); // update internal storage post sorting
						} else {
							display = fieldstate[ destFieldName ].display.slice();
						}
						idmapps.form.setValues( destFieldName, value, display );
						// Highlight values if any
						if ( hlsel.length > 0 ) {
							try {
								idmapps.form.select( destFieldName, hlsel );
							} catch ( e ) {
								console.log( 'Failed select() action against field ' + destFieldName + ', value(s) ' + hlsel.join( ',' ) );
								console.log( 'error message: ' + e.message );
							}
						}
					}
				}
			return true;
		};
	}
	
	return PublicAPI;
})();