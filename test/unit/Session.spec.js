const chai = require("chai");
chai.use(require("chai-generator"));
const expect = chai.expect;

var { Observable } = require("rxjs/Observable");
var { Subject } = require("rxjs/Subject");
var { pluck, take } = require("rxjs/operators");
const mockEngine = require("../util/mock-qix-engine.js");

// RxQ
var connectSession = require("../../dist/connect/connectSession");
var Handle = require("../../dist/handle");
var Session = require("../../dist/session");

describe("Session", function() {

    // Mock Engine for Testing
    var {server, ws} = mockEngine();
    var config = {
        ws
    };
    var eng$ = connectSession(config);
    
    var sesh$ = eng$.pipe(
        pluck("session")
    );

    it("should be a function", function() {
        expect(Session).to.be.a("function");
    });

    it("should have an ask method", function(done) {
        sesh$.subscribe(
            sesh => {
                expect(sesh.ask).to.be.a("function");
                done();
            }
        );
    });

    it("should have a global method", function(done) {
        sesh$.subscribe(
            sesh => {
                expect(sesh.global).to.be.a("function");
                done();
            }
        );
    });

    it("should have a WebSocket Observable", function(done) {
        sesh$.subscribe(
            sesh => {
                expect(sesh.ws$).to.be.instanceof(Observable);
                done();
            }
        );
    });

    it("should have a request Subject", function(done) {
        sesh$.subscribe(
            sesh => {
                expect(sesh.requests$).to.be.instanceof(Subject);
                done();
            }
        );
    });

    it("should have a response Observable", function(done) {
        sesh$.subscribe(
            sesh => {
                expect(sesh.responses$).to.be.instanceof(Observable);
                done();
            }
        );
    });

    it("should have a changes Observable", function(done) {
        sesh$.subscribe(
            sesh => {
                expect(sesh.changes$).to.be.instanceof(Observable);
                done();
            }
        );
    });

    it("should have a sequence integer generator", function(done) {
        sesh$.subscribe(
            sesh => {
                expect(sesh).to.have.property("seqGen");
                done();
            }
        );
    });


    describe("ask method", function() {
        it("should return an Observable", function(done) {
            sesh$.subscribe(
                sesh => {
                    var req = sesh.ask({});
                    expect(req).to.be.instanceof(Observable);
                    done();
                }
            );
        });

        it("should dispatch a method to the request stream", function(done) {
            sesh$.subscribe(
                sesh => {
                    var methodName = "myMethod";

                    sesh.requests$.pipe(
                        take(1)
                    )
                    .subscribe(
                        r => {
                            var method = r.method;
                            expect(method).to.equal(methodName);
                            done();
                        }
                    );
                    
                    var req = sesh.ask({ method: "myMethod" });
                }
            );
        });

        it("should dispatch method parameters to the request stream", function(done) {
            sesh$.subscribe(
                sesh => {
                    var methodParams = ["hello", 42, true];

                    sesh.requests$.pipe(
                        take(1)
                    )
                    .subscribe(
                        r => {
                            var params = r.params;
                            expect(params).to.equal(methodParams);
                            done();
                        }
                    );
                    
                    var req = sesh.ask({ params: methodParams });
                }
            );
        });

        it("should give requests a numeric id", function(done) {
            sesh$.subscribe(
                sesh => {
                    sesh.requests$.pipe(
                        take(1)
                    )
                    .subscribe(
                        r => {
                            var id = r.id;
                            expect(id).to.be.a("number");
                            done();
                        }
                    );
                    
                    var req = sesh.ask({});
                }
            );
        });

    });

    describe("global method", function() {
        it("should return an Observable", function(done) {
            sesh$.subscribe(
                sesh => {
                    var global$ = sesh.global();
                    expect(global$).to.be.instanceof(Observable);
                    done();
                }
            );
        });
    });

    describe("Sequence Generator", function() {
        
        it("should yield a value", function(done) {
            sesh$.subscribe(
                sesh => {
                    var gen = sesh.seqGen;
                    expect(gen).to.yield()
                    done();
                }
            );  
        });

        it("should increment values by 1", function(done) {
            sesh$.subscribe(
                sesh => {
                    var gen = sesh.seqGen;
                    var firstValue = gen.next().value;
                    var secondValue = gen.next().value;
                    expect(secondValue).to.equal(firstValue + 1);
                    done();
                }
            );
        });

    });

    after(function() {
        server.stop();
    });

});

