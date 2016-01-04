
    // chai's expect
    var chai = require( "chai" );
    var expect = chai.expect;
    chai.use( require("chai-shallow-deep-equal") );
    
    // Promise shim
    Promise = ( typeof Promise === "undefined" ) ? require( "promise" ) : Promise;

    // Chandelier
    var Chandelier = require( "../src/chandelier.js" );

    // Instance of chandelier
    var ch = new Chandelier();

    // Set Promise
    ch.Promise = Promise;

    var EXPECTED_TIMEOUT = 2000;

    var original_value = 
    {
        "source": "test",
        "asdfg": [1,2,3,4],
        "obj": {"a":1, "b":2}
    };

    var updated_value = 
    {
        "source": "asd",
        "asdfg": [10,20,30,40],
        "obj": {"a":10, "b":20}
    };                            
    
    describe( "Modification events",
        function ( )
        {
            describe( "create()",
                function ( )
                {
                    it( "emits created event for the created single node",
                        function ( done )
                        {
                            function eventHandler ( e )
                            {
                                if ( e.path.toStringPath() == "/single" )
                                {
                                    done();
                                }
                            }
                            
                            ch.once( "created", "/single", eventHandler );
                            
                            ch.create( "/", {}, {"key": "single"} );
                            
                            ch.off( eventHandler ); 
                        }
                    );

                    it( "emits created events for all nodes in the created structure",
                        function ( done )
                        {
                            var expected_events =
                            {
                                "/multiple":       false,
                                "/multiple/x":     false,
                                "/multiple/a":     false,
                                "/multiple/a/0":   false,
                                "/multiple/a/1":   false,
                                "/multiple/a/2":   false,
                                "/multiple/b":     false,
                                "/multiple/b/a":   false,
                                "/multiple/b/b":   false,
                                "/multiple/b/c":   false
                            }
                            
                            var unexpected_occured = false;
                            
                            function eventHandler( e )
                            {
                                if ( unexpected_occured ) return;
                                
                                var path = e.path.toStringPath();
                                
                                if ( path in expected_events && !expected_events[ path ] )
                                {
                                    expected_events[ path ] = true;
                                }
                                else
                                {
                                    done( new Error( "unexpected event path: " + path ) );
                                    unexpected_occured = true;
                                    return;
                                }
                                
                                var all_true = true;
                                
                                for ( var k in expected_events )
                                {
                                    if ( !expected_events[ k ] ) all_true = false;
                                }
                                
                                if ( all_true ) done();
                            }
                            
                            ch.on( "created", "//", eventHandler );
                            
                            ch.create( "/",
                                {
                                    "x": 5,
                                    "a": [ 1, 2, 3 ],
                                    "b": { "a":0, "b":1, "c":2 }
                                }, {"key": "multiple"} 
                            );
                            
                            ch.off( eventHandler );
                        }
                    );
                    
                    it( "emits created events in breadth-first order",
                        function ( done )
                        {
                            var paths = {};
                            
                            var fail = false;
                            
                            function eventHandler( e )
                            {
                                switch ( e.type )
                                {
                                    case "created":
                                            var path = e.path.toStringPath();
                                            var parent_path = path.split( "/" ).slice( 0, -1 ).join( "/" ); 
                                            
                                            if ( parent_path in paths || path == "/order" )
                                            {
                                                paths[ path ] = null;
                                            }
                                            else
                                            {
                                                fail = true;
                                            }
                                        break;
                                    
                                    case "finished":
                                            if ( fail )
                                            {
                                                done( new Error("wrong order") );
                                            }
                                            else
                                            {
                                                done();
                                            }
                                        break;
                                }
                            }
                            
                            ch.on( ["created","finished"], "//", eventHandler );

                            ch.create( "/",
                                {
                                    "x": 5,
                                    "z": [ 1, 2, 3, 4, 5 ],
                                    "b": { "a":0, "b":{"n":0,"m":1,"w":{"k":1}}, "c":[[0,1,2],[0,1,2]]}
                                }, {"key": "order"} 
                            );
                            
                            ch.emit( "finished", "/", {} );
                            
                            ch.off( eventHandler );
                        }
                    );
                    
                    it( "emits updated event on the target container",
                        function ( done )
                        {
                            ch.create( "/", {"x":7}, {"key": "container"} );
                            
                            function eventHandler( e )
                            {
                                expect( e.message.value ).to.deep.equal( {"x":7, "y":[0,1]} );
                                
                                done();
                            }
                            
                            ch.once( "updated", "/container", eventHandler );

                            ch.create( "/container", [0,1], {"key": "y"} );
                            
                            ch.off( eventHandler ); 
                        }
                    );                        
                    
                    it( "delivers message object with the event",
                        function ( done )
                        {
                            function eventHandler ( e )
                            {
                                try
                                {
                                    expect( e.message ).to.shallowDeepEqual( original_value );
                                    done();
                                }
                                catch ( e )
                                {
                                    done( e );
                                }
                            }
                                
                            ch.once( "created", "/message", eventHandler );
                            
                            ch.create( "/", {}, { "key":"message", "message": original_value } );
                            
                            ch.off( eventHandler ); 
                        }
                    );

                    it( "delivers the value of the node with the event",
                        function ( done )
                        {
                            function eventHandler( e )
                            {
                                try
                                {
                                    expect( e.message.value ).to.deep.equal( original_value );
                                    done();
                                }
                                catch ( e )
                                {
                                    done( e );
                                }                                    
                            }
                            
                            ch.once( "created", "/value", eventHandler );
                            
                            ch.create( "/", original_value, {"key": "value"} );
                            
                            ch.off( eventHandler ); 
                        }
                    );

                }
            );            
            
            describe( "update()",
                function ( )
                {
                    it( "emits updated event for the updated single node",
                        function ( done )
                        {
                            function eventHandler ( e )
                            {
                                done();
                            }
                            
                            ch.once( "updated", "/single", eventHandler );
                            
                            ch.update( "/single", "updated_value" );
                            
                            ch.off( eventHandler ); 
                        }
                    );
                    
                    it( "emits updated events for all nodes in the updated structure",
                        function ( done )
                        {
                            var expected_events =
                            {
                                "/multiple/x":     false,
                                "/multiple/a/0":   false,
                                "/multiple/a/1":   false,
                                "/multiple/a/2":   false,
                                "/multiple/b/a":   false,
                                "/multiple/b/b":   false,
                                "/multiple/b/c":   false
                            }
                            
                            var unexpected_occured = false;
                            
                            function eventHandler( e )
                            {
                                if ( unexpected_occured ) return;
                                
                                var path = e.path.toStringPath();
                                
                                if ( path in expected_events && !expected_events[ path ] )
                                {
                                    expected_events[ path ] = true;
                                }
                                else
                                {
                                    done( new Error( "unexpected event path: " + path ) );
                                    unexpected_occured = true;
                                    return;
                                }
                                
                                var all_true = true;
                                
                                for ( var k in expected_events )
                                {
                                    if ( !expected_events[ k ] ) all_true = false;
                                }
                                
                                if ( all_true ) done();
                            }
                            
                            ch.on( "updated", "//", eventHandler );
                            
                            ch.update( "/multiple",
                                {
                                    "x": 50,
                                    "a": [ 10, 20, 30 ],
                                    "b": { "a":10, "b":11, "c":12 }
                                }
                            );
                            
                            ch.off( eventHandler );                            
                        }
                    );

                    it( "emits created events for new nodes in the updated structure",
                        function ( done )
                        {
                            ch.create( "/", { "x":5, "b":{"a":0} }, {"key":"update"} );
                            
                            var expected_events =
                            {
                                "/update/a":       false,
                                "/update/a/0":     false,
                                "/update/a/1":     false,
                                "/update/a/2":     false,
                                "/update/b/b":     false,
                                "/update/b/c":     false,
                                "/update/b/c/a":   false,
                                "/update/b/c/b":   false
                            }

                            var unexpected_occured = false;   

                            function eventHandler( e )
                            {
                                if ( unexpected_occured ) return;
                                
                                var path = e.path.toStringPath();
                                
                                if ( path in expected_events && !expected_events[ path ] )
                                {
                                    expected_events[ path ] = true;
                                }
                                else
                                {
                                    done( new Error( "unexpected event path: " + path ) );
                                    unexpected_occured = true;
                                    return;
                                }
                                
                                var all_true = true;
                                
                                for ( var k in expected_events )
                                {
                                    if ( !expected_events[ k ] ) all_true = false;
                                }
                                
                                if ( all_true ) done();
                            }
                            
                            ch.on( "created", "//", eventHandler );
                            
                            ch.update( "/update",
                                {
                                    "x": 5,
                                    "a": [ 1, 2, 3 ],
                                    "b": { "a":0, "b":1, "c":{"a":0, "b":0} }
                                }
                            );
                            
                            ch.off( eventHandler );
                        }
                    );
                    
                    it( "emits created events in breadth-first order",
                        function ( done )
                        {
                            ch.create( "/", {}, {"key": "update_order"} );
                            
                            var paths = {"/update_order":null};
                            
                            var fail = false;
                            
                            function eventHandler( e )
                            {
                                switch ( e.type )
                                {
                                    case "created":
                                            var path = e.path.toStringPath();
                                            var parent_path = path.split( "/" ).slice( 0, -1 ).join( "/" ); 
                                            
                                            if ( parent_path in paths )
                                            {
                                                paths[ path ] = null;
                                            }
                                            else
                                            {
                                                console.log( paths );
                                                fail = true;
                                            }
                                        break;
                                    
                                    case "finished":
                                            if ( fail )
                                            {
                                                done( new Error("wrong order") );
                                            }
                                            else
                                            {
                                                done();
                                            }
                                        break;
                                }
                            }
                            
                            ch.on( ["created","finished"], "//", eventHandler );

                            ch.update( "/update_order",
                                {
                                    "x": 5,
                                    "z": [ 1, 2, 3, 4, 5 ],
                                    "b": { "a":0, "b":{"n":0,"m":1,"w":{"k":1}}, "c":[[0,1,2],[0,1,2]]}
                                }
                            );
                            
                            ch.emit( "finished", "/", {} );
                            
                            ch.off( eventHandler );                            
                        }
                    );
                    
                    it( "emits deleted events on removed nodes in the updated structure",
                        function ( done )
                        {
                            var expected_events =
                            {
                                "/update/x":       false,
                                "/update/a/2":     false,
                                "/update/b/a":     false,
                                "/update/b/c":     false,
                                "/update/b/c/a":   false,
                                "/update/b/c/b":   false
                            }

                            var unexpected_occured = false;   

                            function eventHandler( e )
                            {
                                if ( unexpected_occured ) return;
                                
                                var path = e.path.toStringPath();
                                
                                if ( path in expected_events && !expected_events[ path ] )
                                {
                                    expected_events[ path ] = true;
                                }
                                else
                                {
                                    done( new Error( "unexpected event path: " + path ) );
                                    unexpected_occured = true;
                                    return;
                                }
                                
                                var all_true = true;
                                
                                for ( var k in expected_events )
                                {
                                    if ( !expected_events[ k ] ) all_true = false;
                                }
                                
                                if ( all_true ) done();
                            }
                            
                            ch.on( "deleted", "//", eventHandler );
                            
                            ch.update( "/update",
                                {
                                    "a": [ 1, 2 ],
                                    "b": { "b":1, "d":9 },
                                    "y": { "asd": "fgh" }
                                }
                            );
                            
                            ch.off( eventHandler );
                        }
                    );
                    
                    it( "emits deleted events in reverse breadth-first order",
                        function ( done )
                        {
                            var paths = {};
                            
                            var fail = false;
                            
                            function eventHandler( e )
                            {
                                switch ( e.type )
                                {
                                    case "deleted":
                                            var path = e.path.toStringPath();
                                            var parent_path = path.split( "/" ).slice( 0, -1 ).join( "/" ); 
                                            
                                            if ( parent_path in paths )
                                            {
                                                fail = true;
                                            }
                                            else
                                            {
                                                paths[ path ] = null;
                                            }
                                        break;
                                    
                                    case "finished":
                                            if ( fail )
                                            {
                                                done( new Error("wrong order") );
                                            }
                                            else
                                            {
                                                done();
                                            }
                                        break;
                                }
                            }
                            
                            ch.on( ["deleted","finished"], "//", eventHandler );

                            ch.update( "/update_order", {} );
                            
                            ch.emit( "finished", "/", {} );
                            
                            ch.off( eventHandler );                             
                        }
                    );   
                    
                    it( "does not emits update event on nodes that had the same value before the operation",
                        function ( done )
                        {
                            var expected_events =
                            {
                                "/update/a/1":     false,
                                "/update/b/b":     false,
                                "/update/y/asd":   false
                            }

                            var unexpected_occured = false;   

                            function eventHandler( e )
                            {
                                if ( unexpected_occured ) return;
                                
                                var path = e.path.toStringPath();
                                
                                if ( path in expected_events && !expected_events[ path ] )
                                {
                                    expected_events[ path ] = true;
                                }
                                else
                                {
                                    done( new Error( "unexpected event path: " + path ) );
                                    unexpected_occured = true;
                                    return;
                                }
                                
                                var all_true = true;
                                
                                for ( var k in expected_events )
                                {
                                    if ( !expected_events[ k ] ) all_true = false;
                                }
                                
                                if ( all_true ) done();
                            }
                            
                            ch.on( "updated", "//", eventHandler );
                            
                            ch.update( "/update",
                                {
                                    "a": [ 1, 3 ],
                                    "b": { "b":8, "d":9 },
                                    "y": { "asd": "xs" }
                                }
                            );
                            
                            ch.off( eventHandler );                            
                        }
                    );
                    
                    it( "emits update event on nodes that had the same value before the operation if forceUpdate is set in options",
                        function ( done )
                        {
                            var expected_events =
                            {
                                "/update":          false,
                                "/update/a":        false,
                                "/update/a/0":      false,
                                "/update/a/1":      false,
                                "/update/b":        false,
                                "/update/b/b":      false,
                                "/update/b/d":      false,
                                "/update/y":        false,
                                "/update/y/asd":    false
                            }

                            var unexpected_occured = false;   

                            function eventHandler( e )
                            {
                                if ( unexpected_occured ) return;
                                
                                var path = e.path.toStringPath();
                                
                                if ( path in expected_events && !expected_events[ path ] )
                                {
                                    expected_events[ path ] = true;
                                }
                                else
                                {
                                    done( new Error( "unexpected event path: " + path ) );
                                    unexpected_occured = true;
                                    return;
                                }
                                
                                var all_true = true;
                                
                                for ( var k in expected_events )
                                {
                                    if ( !expected_events[ k ] ) all_true = false;
                                }
                                
                                if ( all_true ) done();
                            }
                            
                            ch.on( "updated", "//", eventHandler );
                            
                            ch.update( "/update",
                                {
                                    "a": [ 1, 3 ],
                                    "b": { "b":8, "d":9 },
                                    "y": { "asd": "xs" }
                                }, {"forceUpdate":true}
                            );
                            
                            ch.off( eventHandler );                             
                        }
                    );
                    
                    it( "emits updated event on the container of the new or removed nodes",
                        function ( done )
                        {
                            var expected_events =
                            {
                                "/update/a":     false,
                                "/update/b":     false,
                            }

                            var unexpected_occured = false;   

                            function eventHandler( e )
                            {
                                if ( unexpected_occured ) return;
                                
                                var path = e.path.toStringPath();
                                
                                if ( path in expected_events && !expected_events[ path ] )
                                {
                                    expected_events[ path ] = true;
                                }
                                else
                                {
                                    done( new Error( "unexpected event path: " + path ) );
                                    unexpected_occured = true;
                                    return;
                                }
                                
                                var all_true = true;
                                
                                for ( var k in expected_events )
                                {
                                    if ( !expected_events[ k ] ) all_true = false;
                                }
                                
                                if ( all_true ) done();
                            }
                            
                            ch.on( "updated", "//", eventHandler );
                            
                            ch.update( "/update",
                                {
                                    "a": [ 1, 3, 5 ],
                                    "b": { "b":8 },
                                    "y": { "asd": "xs" }
                                }
                            );
                            
                            ch.off( eventHandler );                             
                        }
                    );    

                    it( "delivers message object with the event",
                        function ( done )
                        {
                            function eventHandler ( e )
                            {
                                try
                                {
                                    expect( e.message ).to.shallowDeepEqual( original_value );
                                    done();
                                }
                                catch ( e )
                                {
                                    done( e );
                                }
                            }
                            
                            ch.once( "updated", "/message", eventHandler );
                            
                            ch.update( "/message", 5, {"message": original_value} );
                            
                            ch.off( eventHandler ); 
                        }
                    );
                   
                    it( "delivers the previous value of the node with the event",
                        function ( done )
                        {
                            ch.update( "/value", original_value );
                            
                            function eventHandler ( e )
                            {
                                try
                                {
                                    expect( e.message.oldValue ).to.deep.equal( original_value );
                                    done();
                                }
                                catch ( e )
                                {
                                    done( e );
                                }                                    
                            }
                            
                            ch.once( "updated", "/value", eventHandler );
                            
                            ch.update( "/value", 5 );
                            
                            ch.off( eventHandler ); 
                        }
                    );
                    
                    it( "delivers the new value of the node with the event",
                        function ( done )
                        {
                            function eventHandler ( e )
                            {
                                try
                                {
                                    expect( e.message.value ).to.deep.equal( updated_value );
                                    done();
                                }
                                catch ( e )
                                {
                                    done( e );
                                }                                    
                            }
                            
                            ch.once( "updated", "/value", eventHandler );
                            
                            ch.update( "/value", updated_value );
                            
                            ch.off( eventHandler ); 
                        }
                    );

                }
            );
            
            describe( "delete()",
                function ( )
                {
                    it( "emits deleted event for the removed single node",
                        function ( done )
                        {
                            function eventHandler ( e )
                            {
                                done();
                            }
                            
                            ch.once( "deleted", "/single", eventHandler );
                            
                            ch.delete( "/single" );
                            
                            ch.off( eventHandler ); 
                        }
                    );                    
                    
                    it( "emits deleted events for all of the nodes of the removed structure",
                        function ( done )
                        {
                            var expected_events =
                            {
                                "/multiple":       false,
                                "/multiple/x":     false,
                                "/multiple/a":     false,
                                "/multiple/a/0":   false,
                                "/multiple/a/1":   false,
                                "/multiple/a/2":   false,
                                "/multiple/b":     false,
                                "/multiple/b/a":   false,
                                "/multiple/b/b":   false,
                                "/multiple/b/c":   false
                            }
                            
                            var unexpected_occured = false;
                            
                            function eventHandler( e )
                            {
                                if ( unexpected_occured ) return;
                                
                                var path = e.path.toStringPath();
                                
                                if ( path in expected_events && !expected_events[ path ] )
                                {
                                    expected_events[ path ] = true;
                                }
                                else
                                {
                                    done( new Error( "unexpected event path: " + path ) );
                                    unexpected_occured = true;
                                    return;
                                }
                                
                                var all_true = true;
                                
                                for ( var k in expected_events )
                                {
                                    if ( !expected_events[ k ] ) all_true = false;
                                }
                                
                                if ( all_true ) done();
                            }
                            
                            ch.on( "deleted", "//", eventHandler );
                            
                            ch.delete( "/multiple");
                            
                            ch.off( eventHandler );                            
                        }
                    );
                    
                    it( "emits deleted events in reverse breadth-first order",
                        function ( done )
                        {
                            var paths = {};
                            
                            var fail = false;
                            
                            function eventHandler( e )
                            {
                                switch ( e.type )
                                {
                                    case "created":
                                            var path = e.path.toStringPath();
                                            var parent_path = path.split( "/" ).slice( 0, -1 ).join( "/" ); 
                                            
                                            if ( parent_path in paths )
                                            {
                                                fail = true;                                                
                                            }
                                            else
                                            {
                                                paths[ path ] = null;
                                            }
                                        break;
                                    
                                    case "finished":
                                            if ( fail )
                                            {
                                                done( new Error("wrong order") );
                                            }
                                            else
                                            {
                                                done();
                                            }
                                        break;
                                }
                            }
                            
                            ch.on( ["created","finished"], "//", eventHandler );

                            ch.delete( "/order" );
                            
                            ch.emit( "finished", "/", {} );
                            
                            ch.off( eventHandler );                            
                        }
                    ); 
                    
                    it( "emits updated event on the container of the target node",
                        function ( done )
                        {
                            function eventHandler( e )
                            {
                                expect( e.message.value ).to.deep.equal( {"x":7} );
                                
                                done();
                            }
                            
                            ch.once( "updated", "/container", eventHandler );

                            ch.delete( "/container/y" );
                            
                            ch.off( eventHandler );                            
                        }
                    );
                    
                    it( "delivers message object with the event",
                        function ( done )
                        {
                            function eventHandler ( e )
                            {
                                try
                                {
                                    expect( e.message ).to.shallowDeepEqual( original_value );
                                    done();
                                }
                                catch ( e )
                                {
                                    done( e );
                                }
                            }
                            
                            ch.once( "deleted", "/message", eventHandler );
                            
                            ch.delete( "/message", {"message": original_value} );     

                            ch.off( eventHandler );                             
                        }
                    );

                    it( "delivers the value of the node with the event",
                        function ( done )
                        {
                            function eventHandler ( e )
                            {
                                try
                                {
                                    expect( e.message.value ).to.deep.equal( updated_value );
                                    done();
                                }
                                catch ( e )
                                {
                                    done( e );
                                }                                    
                            }
                            
                            ch.once( "deleted", "/value", eventHandler );
                            
                            ch.delete( "/value" );
                            
                            ch.off( eventHandler ); 
                        }
                    );
                                      
                }
            );

        }
    );






