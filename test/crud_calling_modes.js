
    // chai's expect
    var expect = require( "chai" ).expect;

    // Promise shim
    Promise = ( typeof Promise === "undefined" ) ? require( "promise" ) : Promise;

    // Chandelier
    var Chandelier = require( "../src/chandelier.js" );

    // Instance of chandelier
    var ch = new Chandelier();

    // Set Promise
    ch.Promise = Promise;

    describe( "CRUD calling modes",
        function ( )
        {
            ////////////////////////////////////////////////////////////
            //  CREATE
            ////////////////////////////////////////////////////////////

            describe( "create()",
                function ( )
                {
                    it( "calls callback function without error on successful operation",
                        function ( done )
                        {
                            ch.create( "/", {"asd":"asd"}, {"key": "test"},
                                function ( err, match )
                                {
                                    done( err );
                                }
                            );
                        }
                    );

                    it( "calls callback function with error on unsuccessful operation",
                        function ( done )
                        {
                            ch.create( "/nonexistent", {"asd":"asd"}, {"key": "test"},
                                function ( err, match )
                                {
                                    done( !err );
                                }
                            );
                        }
                    );

                    it( "resolves promise on successful operation",
                        function ( )
                        {
                            return ch.create( "/", {"fgs":"fds"}, {"key":"promise"} );
                        }
                    );

                    it( "rejects promise on unsuccessful operation",
                        function ( )
                        {
                            return ch.create( "/nonexistent", {"fgs":"fds"}, {"key":"promise"} ).then(
                                function ( matches )
                                {
                                    return ch.Promise.reject("");
                                },
                                function ( err )
                                {
                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );
                }
            );

            ////////////////////////////////////////////////////////////
            //  READ
            ////////////////////////////////////////////////////////////

            describe( "read()",
                function ( )
                {
                    it( "calls callback function without error on successful operation",
                        function ( done )
                        {
                            ch.read( "/",
                                function ( err, match )
                                {
                                    done( err );
                                }
                            );
                        }
                    );

                    it( "calls callback function with error on unsuccessful operation",
                        function ( done )
                        {
                            ch.read( "/nonexistent",
                                function ( err, match )
                                {
                                    done( !err );
                                }
                            );
                        }
                    );

                    it( "resolves promise on successful operation",
                        function ( )
                        {
                            return ch.read( "/promise" );
                        }
                    );

                    it( "rejects promise on unsuccessful operation",
                        function ( )
                        {
                            return ch.read( "/nonexistent" ).then(
                                function ( matches )
                                {
                                    return ch.Promise.reject("");
                                },
                                function ( err )
                                {
                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );
                }
            );

            ////////////////////////////////////////////////////////////
            //  UDPATE
            ////////////////////////////////////////////////////////////

            describe( "update()",
                function ( )
                {
                    it( "calls callback function without error on successful operation",
                        function ( done )
                        {
                            ch.update( "/", {"asd":"asd", "promise":123},
                                function ( err, match )
                                {
                                    done( err );
                                }
                            );
                        }
                    );

                    it( "calls callback function with error on unsuccessful operation",
                        function ( done )
                        {
                            ch.update( "/nonexistent", {"asd":"asd"},
                                function ( err, match )
                                {
                                    done( !err );
                                }
                            );
                        }
                    );

                    it( "resolves promise on successful operation",
                        function ( )
                        {
                            return ch.update( "/promise", {"asd":456} );
                        }
                    );

                    it( "rejects promise on unsuccessful operation",
                        function ( )
                        {
                            return ch.update( "/nonexistent", {"asd":456} ).then(
                                function ( matches )
                                {
                                    return ch.Promise.reject("");
                                },
                                function ( err )
                                {
                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );
                }
            );

            ////////////////////////////////////////////////////////////
            //  DELETE
            ////////////////////////////////////////////////////////////

            describe( "delete()",
                function ( )
                {
                    it( "calls callback function without error on successful operation",
                        function ( done )
                        {
                            ch.delete( "/asd",
                                function ( err, match )
                                {
                                    done( err );
                                }
                            );
                        }
                    );

                    it( "calls callback function with error on unsuccessful operation",
                        function ( done )
                        {
                            ch.delete( "/nonexistent",
                                function ( err, match )
                                {
                                    done( !err );
                                }
                            );
                        }
                    );

                    it( "resolves promise on successful operation",
                        function ( )
                        {
                            return ch.delete( "/promise/asd" );
                        }
                    );

                    it( "rejects promise on unsuccessful operation",
                        function ( )
                        {
                            return ch.delete( "/nonexistent" ).then(
                                function ( matches )
                                {
                                    return ch.Promise.reject("");
                                },
                                function ( err )
                                {
                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                }
            );

        }
    );