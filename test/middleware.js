
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

    describe( "Middlewares",
        function ( )
        {
            beforeEach(
                function( done )
                {
                    // Instance of chandelier
                    ch = new Chandelier();

                    // Set Promise
                    ch.Promise = Promise;

                    done();
                }
            );

            /*
                create
            */

            describe( "create()",
                function ( )
                {
                    it( "with path",
                        function ( done )
                        {
                            var first = false;
                            var second = false;

                            var params =
                            {
                                "options": { "key": "fgs" },
                                "value": "value",
                                "path": ["$root", "asd"]
                            }

                            ch.use( "create", "/asd",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );

                                    if ( first && second )
                                    {
                                        done();
                                    }

                                    next();
                                }
                            );

                            ch.use( "create", "/asd",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    second = true;

                                    params.second = null;
                                    parameters.second = null;

                                    next();
                                }
                            );

                            ch.use( "create", "/asd",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    first = true;

                                    params.first = 1;
                                    parameters.first = 1;

                                    next();
                                }
                            );

                            ch.create( params.path, params.value, {"key": params.options.key} );
                        }
                    );

                    it( "without path",
                        function ( done )
                        {
                            var first = false;
                            var second = false;

                            var params =
                            {
                                "options": { "key": "fgs" },
                                "value": "value",
                                "path": ["$root", "asd"]
                            }

                            ch.use( "create",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );

                                    if ( first && second )
                                    {
                                        done();
                                    }

                                    next();
                                }
                            );

                            ch.use( "create",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    second = true;

                                    params.second = null;
                                    parameters.second = null;

                                    next();
                                }
                            );

                            ch.use( "create",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    first = true;

                                    params.first = 1;
                                    parameters.first = 1;

                                    next();
                                }
                            );

                            ch.create( params.path, params.value, {"key": params.options.key} );
                        }
                    );
                }
            );

            /*
                read
            */

            describe( "read()",
                function ( )
                {
                    it( "with path",
                        function ( done )
                        {
                            var first = false;
                            var second = false;

                            var params =
                            {
                                "path": ["$root", "asd"]
                            }

                            ch.use( "read", "/asd",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );

                                    if ( first && second )
                                    {
                                        done();
                                    }

                                    next();
                                }
                            );

                            ch.use( "read", "/asd",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    second = true;

                                    params.second = null;
                                    parameters.second = null;

                                    next();
                                }
                            );

                            ch.use( "read", "/asd",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    first = true;

                                    params.first = 1;
                                    parameters.first = 1;

                                    next();
                                }
                            );

                            ch.read( params.path );
                        }
                    );

                    it( "without path",
                        function ( done )
                        {
                            var first = false;
                            var second = false;

                            var params =
                            {
                                "path": ["$root", "asd"]
                            }

                            ch.use( "read",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );

                                    if ( first && second )
                                    {
                                        done();
                                    }

                                    next();
                                }
                            );

                            ch.use( "read",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    second = true;

                                    params.second = null;
                                    parameters.second = null;

                                    next();
                                }
                            );

                            ch.use( "read",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    first = true;

                                    params.first = 1;
                                    parameters.first = 1;

                                    next();
                                }
                            );

                            ch.read( params.path );
                        }
                    );
                }
            );
            /*
                update
            */

            describe( "update()",
                function ( )
                {
                    it( "with path",
                        function ( done )
                        {
                            var first = false;
                            var second = false;

                            var params =
                            {
                                "value": "value",
                                "path": ["$root", "asd"]
                            }

                            ch.use( "update", "/asd",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );

                                    if ( first && second )
                                    {
                                        done();
                                    }

                                    next();
                                }
                            );

                            ch.use( "update", "/asd",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    second = true;

                                    params.second = null;
                                    parameters.second = null;

                                    next();
                                }
                            );

                            ch.use( "update", "/asd",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    first = true;

                                    params.first = 1;
                                    parameters.first = 1;

                                    next();
                                }
                            );

                            ch.update( params.path, params.value );
                        }
                    );

                    it( "without path",
                        function ( done )
                        {
                            var first = false;
                            var second = false;

                            var params =
                            {
                                "value": "value",
                                "path": ["$root", "asd"]
                            }

                            ch.use( "update",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );

                                    if ( first && second )
                                    {
                                        done();
                                    }

                                    next();
                                }
                            );

                            ch.use( "update",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    second = true;

                                    params.second = null;
                                    parameters.second = null;

                                    next();
                                }
                            );

                            ch.use( "update",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    first = true;

                                    params.first = 1;
                                    parameters.first = 1;

                                    next();
                                }
                            );

                            ch.update( params.path, params.value );
                        }
                    );
                }
            );
            /*
                delete
            */

            describe( "delete()",
                function ( )
                {
                    it( "with path",
                        function ( done )
                        {
                            var first = false;
                            var second = false;

                            var params =
                            {
                                "path": ["$root", "asd"]
                            }

                            ch.use( "delete", "/asd",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );

                                    if ( first && second )
                                    {
                                        done();
                                    }

                                    next();
                                }
                            );

                            ch.use( "delete", "/asd",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    second = true;

                                    params.second = null;
                                    parameters.second = null;

                                    next();
                                }
                            );

                            ch.use( "delete", "/asd",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    first = true;

                                    params.first = 1;
                                    parameters.first = 1;

                                    next();
                                }
                            );

                            ch.delete( params.path );
                        }
                    );

                    it( "without path",
                        function ( done )
                        {
                            var first = false;
                            var second = false;

                            var params =
                            {
                                "path": ["$root", "asd"]
                            }

                            ch.use( "delete",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );

                                    if ( first && second )
                                    {
                                        done();
                                    }

                                    next();
                                }
                            );

                            ch.use( "delete",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    second = true;

                                    params.second = null;
                                    parameters.second = null;

                                    next();
                                }
                            );

                            ch.use( "delete",
                                function( parameters, next, method )
                                {
                                    expect( parameters ).to.shallowDeepEqual( params );
                                    first = true;

                                    params.first = 1;
                                    parameters.first = 1;

                                    next();
                                }
                            );

                            ch.delete( params.path );
                        }
                    );
                }
            );
            
            /*
                multiple methods
            */

            describe( "multiple methods",
                function ( )
                {
                    it( "with path",
                        function ( done )
                        {
                            var read_first = false;
                            var read_second = false;
                            
                            var delete_first = false;
                            var delete_second = false;

                            var first_done = null;
                            
                            var update_params =
                            {
                                "value": "value",
                                "path": ["$root", "asd"]
                            }
                            
                            var create_params =
                            {
                                "options": { "key": "fgs" },
                                "value": "value",
                                "path": ["$root", "asd"]
                            }
                            
                            ch.use( ["create","update"], "/asd",
                                function( parameters, next, method )
                                {
                                    if ( method == "create" )
                                    {
                                        expect( parameters ).to.shallowDeepEqual( create_params );
                                        
                                        if ( create_first && create_second )
                                        {
                                            if ( first_done == "update" )
                                            {
                                                done();
                                            }
                                            else
                                            {
                                                first_done = "create";
                                            }
                                        }                                    
                                    }
                                    else
                                    {
                                        expect( parameters ).to.shallowDeepEqual( update_params );
                                        
                                        if ( update_first && update_second )
                                        {
                                            if ( first_done == "create" )
                                            {
                                                done();
                                            }
                                            else
                                            {
                                                first_done = "update";
                                            }
                                        }                                       
                                    }

                                    next();
                                }
                            );               
                            
                            ch.use( ["create","update"], "/asd",
                                function( parameters, next, method )
                                {
                                    if ( method == "create" )
                                    {
                                        expect( parameters ).to.shallowDeepEqual( create_params );
                                        
                                        create_second = true;
                                        create_params.second = 2;
                                        parameters.second = 2;
                                    }
                                    else
                                    {
                                        expect( parameters ).to.shallowDeepEqual( update_params );
                                        
                                        update_second = true;
                                        update_params.second = 2;
                                        parameters.second = 2;                                        
                                    }

                                    next();
                                }
                            );          
                            
                            ch.use( ["create","update"], "/asd",
                                function( parameters, next, method )
                                {
                                    if ( method == "create" )
                                    {
                                        expect( parameters ).to.shallowDeepEqual( create_params );
                                        
                                        create_first = true;
                                        create_params.first = 1;
                                        parameters.first = 1;                                        
                                    }
                                    else
                                    {
                                        expect( parameters ).to.shallowDeepEqual( update_params );
                                        
                                        update_first = true;
                                        update_params.first = 1;
                                        parameters.first = 1;                                        
                                    }

                                    next();
                                }
                            ); 

                            ch.create( create_params.path, create_params.value, create_params.options );
                            
                            ch.update( update_params.path, update_params.value );
                        }
                    );                    
                    
                    it( "without path",
                        function ( done )
                        {
                            var read_first = false;
                            var read_second = false;
                            
                            var delete_first = false;
                            var delete_second = false;

                            var first_done = null;
                            
                            var update_params =
                            {
                                "value": "value",
                                "path": ["$root", "asd"]
                            }
                            
                            var create_params =
                            {
                                "options": { "key": "fgs" },
                                "value": "value",
                                "path": ["$root", "asd"]
                            }
                            
                            ch.use( ["create","update"],
                                function( parameters, next, method )
                                {
                                    if ( method == "create" )
                                    {
                                        expect( parameters ).to.shallowDeepEqual( create_params );
                                        
                                        if ( create_first && create_second )
                                        {
                                            if ( first_done == "update" )
                                            {
                                                done();
                                            }
                                            else
                                            {
                                                first_done = "create";
                                            }
                                        }                                    
                                    }
                                    else
                                    {
                                        expect( parameters ).to.shallowDeepEqual( update_params );
                                        
                                        if ( update_first && update_second )
                                        {
                                            if ( first_done == "create" )
                                            {
                                                done();
                                            }
                                            else
                                            {
                                                first_done = "update";
                                            }
                                        }                                       
                                    }

                                    next();
                                }
                            );               
                            
                            ch.use( ["create","update"],
                                function( parameters, next, method )
                                {
                                    if ( method == "create" )
                                    {
                                        expect( parameters ).to.shallowDeepEqual( create_params );
                                        
                                        create_second = true;
                                        create_params.second = 2;
                                        parameters.second = 2;
                                    }
                                    else
                                    {
                                        expect( parameters ).to.shallowDeepEqual( update_params );
                                        
                                        update_second = true;
                                        update_params.second = 2;
                                        parameters.second = 2;                                        
                                    }

                                    next();
                                }
                            );          
                            
                            ch.use( ["create","update"],
                                function( parameters, next, method )
                                {
                                    if ( method == "create" )
                                    {
                                        expect( parameters ).to.shallowDeepEqual( create_params );
                                        
                                        create_first = true;
                                        create_params.first = 1;
                                        parameters.first = 1;                                        
                                    }
                                    else
                                    {
                                        expect( parameters ).to.shallowDeepEqual( update_params );
                                        
                                        update_first = true;
                                        update_params.first = 1;
                                        parameters.first = 1;                                        
                                    }

                                    next();
                                }
                            ); 

                            ch.create( create_params.path, create_params.value, create_params.options );
                            
                            ch.update( update_params.path, update_params.value );
                        }
                    );                    


                }
            );
            
        }
    );
    