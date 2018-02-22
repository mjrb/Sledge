(function () {
"use strict";

// TODO: Get actual judge id
var myJudgeId = 1;

var judge = {};
window.judge = judge;

function init() {
    // TODO: Get Actual Token
    sledge.init({token: "test"});

    var appContainer = document.getElementById("app");
    ReactDOM.render(
        React.createElement(
            JudgeAppWrapper, null), appContainer);
}
judge.init = init;
window.addEventListener("load", init);

function getSledgeData() {
    if (sledge.isInitialized()) {
        let hacks = sledge.getAllHacks();
        let judgeInfo = sledge.getJudgeInfo({
            judgeId: myJudgeId
        });
        let orderInfo = sledge.getHacksOrder({
            judgeId: myJudgeId
        });
        let superlatives = sledge.getSuperlatives();
        let chosenSuperlatives = sledge.getChosenSuperlatives({
            judgeId: myJudgeId
        });
        let ratings = sledge.getJudgeRatings({
            judgeId: myJudgeId
        });

        this.state = {
            initialized: false,
	    listViewActive: false,
            judgeHacks: [],
            ratings: [],
            currentHackPos: -1,
            judge: {
                id: 0,
                name: "[Judge not found]",
                email: "notfound@example.com"
            },
            superlatives: [],
            chosenSuperlatives: [],
            judgeId: 1 //TODO: What judge?
        };

        if ( sledge.isInitialized() )
            this.updateSledgeData();
    }
    switchView() {
	this.setState({listViewActive:!this.state.listViewActive});
    }
    updateSledgeData() {
        this.setState( (prevState, props) => {
            let hacks = sledge.getHacksTable();

            let currentHackPos = prevState.currentHackPos;
            let judge = sledge.getJudgeInfo(1);
            let judgeHacks = sledge.getJudgeHacks(this.state.judgeId);
            let superlatives = sledge.getSuperlatives();
            let chosenSuperlatives = sledge.getChosenSuperlatives(this.state.judgeId);
            let ratings = sledge.getJudgeRatings(this.state.judgeId);

            if ( currentHackPos < 0 && judgeHacks.length > 0 )
                currentHackPos = 0;

            return {
                initialized: true,
                hacks,

                judge,
                ratings,
                judgeHacks,
                currentHackPos,
                superlatives,
                chosenSuperlatives
            };
        });
    }
}

    calcSuperlatives() {
        return this.state.superlatives.map( s => ({
            name: s.name,
            id: s.id,
            chosenFirstId: this.state.chosenSuperlatives[s.id].first,
            chosenSecondId: this.state.chosenSuperlatives[s.id].second
        }));
    }
    listView(){
        let hacks = sledge.getHacksTable();
	let names = hacks.map((hack)=>hack.name);
	console.log(names)
        return e("div", { className: "container d-flex judge-container" },
            e(judge.Toolbar, {
                onPrev: () => {
                    this.setState( (prevState, props) => {
                        if ( prevState.currentHackPos-1 >= 0 )
                            return { currentHackPos: prevState.currentHackPos-1 };
                        else
                            return {};
                    });
                },
                onList: this.switchView.bind(this),
                onNext: () => {
                    this.setState( (prevState, props) => {
                        if ( prevState.currentHackPos+1 < prevState.judgeHacks.length )
                            return { currentHackPos: prevState.currentHackPos+1 };
                        else
                            return {};
                    });
                },
            }),
            e(judge.JudgeInfo, {
                name: this.state.judge.name
            }),
            e(judge.ProjectList, {
		projects:[{pname:"proj1"},{pname:"proj2"}]
	    })
        );
    }
    renderReady() {
        let currentHack = this.getCurrentHack();

        return e("div", { className: "container d-flex judge-container" },
            e(judge.Toolbar, {
                onPrev: () => {
                    this.setState( (prevState, props) => {
                        if ( prevState.currentHackPos-1 >= 0 )
                            return { currentHackPos: prevState.currentHackPos-1 };
                        else
                            return {};
                    });
                },
                onList: this.switchView.bind(this),
                onNext: () => {
                    this.setState( (prevState, props) => {
                        if ( prevState.currentHackPos+1 < prevState.judgeHacks.length )
                            return { currentHackPos: prevState.currentHackPos+1 };
                        else
                            return {};
                    });
                },
            }),
            e(judge.JudgeInfo, {
                name: this.state.judge.name
            }),
            e(judge.Project, {
                name: currentHack.name,
                description: currentHack.description,
                location: currentHack.location
            }),
            e(judge.RatingBox, {
                chosen: this.state.ratings[currentHack.id],
                onSubmit: r => {
                    sledge.rateHack(this.state.judgeId, currentHack.id, r)
                },
                hackId: currentHack.id
            }),
            e(judge.Superlatives, {
                superlatives: this.calcSuperlatives(),
                hacks: this.state.hacks,
                currentHackId: currentHack.id,
                onSubmit: (superId, choices) => {
                    sledge.rankSuperlative(this.state.judgeId, superId, choices.first, choices.second)
                }
            })
        );
    }

    componentDidMount() {
        sledge.subscribe(this.onUpdate.bind(this));
    }

    render() {
	if (this.state.initialized) {
	    if(this.state.listViewActive) {
		return this.listView();
	    }
            return this.renderReady();
        } else {
            return this.renderLoading();
        }
    }

    render() {
        if (this.state.sledge.initialized) {
            return React.createElement(
                    judge.JudgeApp, this.state.sledge);
        } else {
            return React.createElement(
                    "span", null, "Loading...");
        }
    }
}

})();
