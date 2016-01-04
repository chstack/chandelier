[![Build Status](https://travis-ci.org/laszlokardinal/chandelier.svg)](https://travis-ci.org/laszlokardinal/chandelier)
[![npm](https://img.shields.io/npm/v/chandelier.svg)](https://www.npmjs.com/package/chandelier)
[![bower](https://img.shields.io/bower/v/chandelier.svg)]()
[![release](https://img.shields.io/github/release/laszlokardinal/chandelier.svg)](https://github.com/laszlokardinal/chandelier/releases)

# Chandelier

Chandelier is a data management system for javascript, with CRUD operations, and event handling, supporting ES6 promises. It can be used as the model in the MVC pattern.

This project is in development.

## Functions
### Chandelier( )
Creates an instance of chandelier.
```javascript
// create instance
var ch = new Chandelier();
```
### CRUD operations
#### create ( path, value, options, callback )
Creates elements in the data structure.

If the target container is an object, and the key is not defined, the generateKey function will be used to generate one.

If the target container is an array, and the key is defined, the value will be inserted to that index. If the key is not defined the value will be pushed to the end of the array.

- **path** Path of the **target container** where we add the given value.
- **value** Value of the element to add
- **options** *(optional)* Object that can contain extra parameters:
    - **key** The desired key for the element in the container
    - **message** Message object to pass with the events
- **callback** *(optional)* Error first callback function with the following parameters: ( error, [{path}] ). If it's not defined, the function returns a promise.
```javascript
ch.create( "/", ["tomato", "cucumber", "carrot"], {key: "vegetables"},
    function ( err )
    {
        if ( !err ) 
            console.log( "yaay" );
    }
);

ch.create( "/", {lemon: "yellow", apple: "red", pear: "green"}, {key: "fruits"} ).then(
    function ( )
    {
        console.log( "yaay" );
    }
).catch(
    function ( )
    {
        console.log( "naay" );
    }
);
```    
#### read ( path, options, callback )
Read elements from the data structure
- **path** The path of the **elements** that we want to read
- **options** *(optional)*
    - **message** Message object to pass with the events
- **callback** *(optional)* Error first callback function with the following parameters: ( error, [{path,value}] ). If it's not defined, the function returns a promise.
```javascript
// read all elements of the fruits object
ch.read( "/fruits/*",
    function ( err, matches ) // called once
    {
        if ( !err )
        {
            for( var i=0; i<matches.length; ++i )
            {
                console.log( matches[i].path.toStringPath() + ": " + matches[i].value );
            }
        }
    }
);

// read the value of lemon using promise
ch.read( "/fruits/lemon" ).then(
    function( matches )
    {
        console.log( matches[0].path.toStringPath() ); // "/fruits/lemon"
        console.log( matches[0].value ); // "yellow"
    }
);
```
#### update ( path, value, options, callback )
Updates elements in the data structure
- **path** Path of the **elements** that we want to overwrite
- **value** The new value of the elements
- **options** *(optional)* Object that can contain extra parameters:
    - **forceUpdate** By default, update operation won't emit events on nodes, what are in the updated data tree, but their value has not changed. If it's set to true, it generates an emit on every node.
    - **message** Message object to pass with the events
- **callback** *(optional)* Error first callback function with the following parameters: ( error, [{path, previousValue}] ). If it's not defined, the function returns a promise. 
```javascript    
// update apple with string path
ch.update( "/fruits/apple", "green",
    function ( err, matches )
    {
        if ( !err ) console.log( "done" );
    }
);

// update pear with array path
ch.update( ["$root","fruits","pear"], "brown" );

// update the second vegetable to onion
ch.update( "/vegetables/1", "onion" ).then(
    function ( )
    {
        // then read the vegetables array
        return ch.read( "/vegetables" );
    }
).then(
    function ( matches )
    {
        // print the content of vegetables array
        console.log( matches[0].value.join(", ") );
    }
);
```
#### delete ( path, options, callback )
Removes elements from the data structure
- **path** Path of the **elements** that we want to remove
- **options** *(optional)* Object that can contain extra parameters:
    - **message** Message object to pass with the events
- **callback** *(optional)* Error first callback function with the following parameters: ( error, [{path, value}] ). If it's not defined, the function returns a promise. 
```javascript      
// remove apple
ch.delete( "/fruits/apple",
    function ( err, matches )
    {
        if ( !err ) 
            console.log( matches[0].value + " is removed from " + matches[0].path.toStringPath() );
        else
            console.log( err );
    }
);
```     
### Events
#### emit ( type, path, message )
Emits an event to the subscribed listener functions.
- **type** String Id of the event type
- **path** Path of the event
- **message** Message object
```javascript
// if my custom event type occurs on any path
ch.on( "myEvent", "//",
    function( e )
    {
        console.log( e.message.myStuff );
    }
);

// emit custom type of event on the root
ch.emit( "myEvent", "/", { "myStuff": "asd" } );
```
#### on ( types, path, callback )
Subscribes a function to an event type.
- **types** Id of the event type (String), or Ids of event types (Array of Strings). If it's "*", it will get any types of events.
- **path** Path of the event    
- **callback** Event handler function, that will be called with an event object if an event occurs.
```javascript
// if a fruit has been created
ch.on( "created", "/fruits/*",
    function( e )
    {
        // we create a div for it
        $( "<div>" ).attr( "data-fruit", e.path[2] ).appendTo( "#fruitsDiv" );
    }
);    

// if any fruit is created or updated
ch.on( ["created","updated"], "/fruits/*", 
    function( e )
    {
        // we update it's div
        $( "#fruitsDiv > [data-fruit=" + e.path[2] + "]" ).html( e.message.value );    
    }
);

function onFruitDeleted( e )
{
    // we remove it's div
    $( "#fruitsDiv > [data-fruit=" + e.path[2] + "]" ).remove();
}

// if any fruit is deleted
ch.on( "deleted", "/fruits/*", onFruitDeleted );
 
```
#### once ( types, path, callback )
Subscribes a function to an event type. The handler will be removed after it called only once.
- **types** Id of the event type (String), or Ids of event types (Array of Strings). If it's "*", it will get all types of events.
- **path** Path of the event    
- **callback** Event handler function, that will be called with an event object if an event occurs.
```javascript
ch.once( "created", "/fruits/*",
    function( e )
    {
        console.log( "The first fruit has been created." );
    }
);
```
#### off ( callback )
Unsubscribes a function from an event.
- **callback** The callback function we want to remove.
```javascript
ch.off( onFruitDeleted );
```
### Middlewares
#### use ( methodName, path, middleware )
Adds a middleware into the stack
- **methodName** The name of the method (string), or names of the methods (array of strings)
- **path** *(optional)* The path to suit (optional)
- **middleware** The middleware function ( parameters, next, methodName )
```javascript

// prevent updating the root element
ch.use( "update", "/",
    function( parameters, next, methodName )
    {
        parameters.callback( new Error("Can't update root") );
    }
);    
```

## Data structure

The data structure can contain any javascript type, that can be serialized to JSON.
The object keys must be strings, that must not be an empty string, and must not contain the following characters:
```
/*.,()[]|\"'
```
Don't use keys starting with _ for elements that you want to synchronize. Private nodes are planned to implement in later versions.

Array keys (indexes) must be integer numbers, or strings that can be converted to integer numbers.

The length property of an array in the structure is readable, but can't be written.

## Path

Every path parameter can be defined by a string or an array of identifiers. 
Every event object, or callback that gets a path parameter will get the array form of paths, but the array object will have a "toStringPath" function binded to it, that returns the string format.

The conversion between the two types can be make with the "fromStringPath" and "toStringPath" functions.

Currently supported path expressions:
 - Root selector ( "/" or ["$root"] )
 - String key (e.g. "/fruits/banana" or ["$root","fruits","banana"])
 - Number key (e.g. "/vegetables/2" or ["$root,"vegetables",2])
 - Wildcard selector, that matches any path ("//" or ["$any"])
 - Wildcard selector, that matches every key (e.g. "/vegetables/*" or ["$root,"vegetables","$one"])

In the current version paths must start with root (except the any selector).

## Events
    
### Event object

For each event an object will be created that contains the following properties:
- **type** String identifier of the event
- **path** Array of the path, with a function called "toStringPath" binded to it, that converts the path to a string path.
- **message** Message object that contains the parameters of the event.

Modifying properties of the event object is forbidden.

Don't use event type identifiers starting with _ for events that you want to send through synchronization adapters. Private event types are planned to implement in later versions.

### Emitting events

Custom event types can be emitted by the emit function.

We have to define an exact type, and path, wildcard expressions can't be used.
Paths that do not exist in the data structure can be used for event paths. 

Emitting built in event types is forbidden.

### Subscription

Functions can be registered to event types with the on and once functions.
The function "on" creates a permanent subscription. The function "once" makes an on-off subscription, that will be removed after getting invoked.
Both can be unregistered by the off function.

When we subscribe a function we have to define an event **type**, or we can use the "*" string. With that, our function will get every type of events.

We have to define a **path**. We can use the wildcard parts.

The registered **callback** function will be invoked if an event that fits the conditions occurs. The callback function gets only one event object parameter.

Example:
```javascript        
// log each type of event on any path to the console
ch.on( "*", "//",
    function( e )
    {
        console.log( "----------------------------------" );
        console.log( e.type + " @ " + e.path.toStringPath() );
        console.log( JSON.stringify( e.message, 0, 4 ) );
    }
);    
```

### Event types

**Modification events** will occur when we apply modifications on the data structure.
Modification events are private, they won't be sent via synchronization interface.

These events are:
- **created** The message contains the value of the element. The last part of the path is the key of the new element.
- **updated** The message contains the current value (value), and the previous value (previousValue) of the element.
- **deleted** The message contains the value of the element.

### Callback / Promises
Chandelier uses error first callback functions on CRUD operations.
That means that the first parameter will always be null if the operation succeed, otherwise it will be an Error object that contains the error message.
 
#### Callbacks
The callback function will be called only once.
If all of the operations succeed, the callback will be called with null as the error, and the array of matches of the successful operations.
If any of the operations fails, the callback will be called with an Error object that contains the error message.

Example:
```javascript
ch.create( "/objects/*", 0, {key:"tomato"},
    function( err, matches )
    {
        if ( err )
        {
            console.log( "failure" );
            console.log( err );
        }
        else
        {
            console.log( "success" );
            
            for ( var i=0; i<matches.length; ++i )
            {
                console.log( matches[i].path );
            }
        }
    }
);
```
These callbacks have the following parameters on the operations:
 - on create: ( error, [ { path } ] )
 - on read: ( error, [ { value, path } ] )
 - on update: ( error, [ { previousValue, path } ] )
 - on delete: ( error, [ { value, path } ] )
 
#### Promises
If the callback functions are not defined when we call CRUD functions, they returns promises. (only if the environments supports it)
If all of the operations succeed, the promise will be fulfilled with the array of matches of the successful operations.
If any of the operations fail, the promise will be rejected with an Error object that contains the error message.

Example:
```javascript
ch.create( "/objects/*", 0, {key:"tomato"} ).then(
    function( matches )
    {
        console.log( "success" );
            
        for ( var i=0; i<matches.length; ++i )
        {
            console.log( matches[i].path );
        }
    }
).catch(
    function( err )
    {
        console.log( "failure" );
        console.log( err );
    }
);
```

Custom promise implementations can be used by overwriting the Promise property of the instances.
If "Promise" is previously defined globally, the constructor sets this property to the defined constructor automatically.

### Middlewares

While event handlers can only be used to make effects of the modifications,
with middlewares, we can prevent these operations, or expand the functionality of the model.

Registered middlewares must guarantee the following:
 - next() function can be called maximum once in a middleware.
 - the callback function from the parameters object must be called, and must be called only once, with the proper arguments list.

Middlewares can be registered for the following functions:
 - __create__: the parameters objects contains the callback function (callback), the array of path (path), the desired value (value), and the options object (options).
 - __read__: the parameters objects contains the callback function (callback), the array of path (path), and the options object (options).
 - __update__: the parameters objects contains the callback function (callback), the array of path (path), the desired value (value), and the options object (options).
 - __delete__: the parameters objects contains the callback function (callback), the array of path (path), and the options object (options).
 
## Plans for the future

### In development
 - Validation
 - Synchronization interface for plugins (for communication between models, or between model and storage) 
 - Master/slave synchronization modes for client-server architecture
 - Private data nodes and event types, that avoid synchronization

# License

The MIT License (MIT)

Copyright (c) 2016 László Kardinál

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

