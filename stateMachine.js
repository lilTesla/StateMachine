(function() {
    /**
     * @method entryStateInitializer
     * @description Method that should return state machine's entry state
     * @return {string} entry state of state machine
     */

    /**
     * @callback stateChangedCallback
     * @description Method that is invoked when any transition is finished (for rendering or logging mostly)
     * @param {string} newState - a new state set in result of transition
     */

    /**
     * @method smAction
     * @description Method that is invoked during transition
     * @param {...*} args - any type parameters. Arguments should be passed to makeTransition method of state machine
     * @return {$.Deferred} dfr - a JQuery.Deferred instance should be returned. State is changed only on dfr resolving
     */

    /**
     * @typedef {Object} smTransition
     * @property {string} fromSt - a starting state of the transition
     * @property {string} toSt - a destination state of the transition
     * @property {smAction} action - function that is invoked during transition
     */

    /**
     * @param {String[]} states - an array of state machine's states
     * @param {String[]} alphabet - an array of words for transitioning between states
     * @param {Object[]} transitions - an object with alphabet's words as keys
     * @param {smTransition[]} transitions.word - an array of transitions for the word
     * @param {entryStateInitializer} entryStateInitializer
     * @param {stateChangedCallback} stateChangedCallback
     * @constructor
     */
    function StateMachine(states, alphabet, transitions, entryStateInitializer, stateChangedCallback)
    {
        this.states = states;
        this.alphabet = alphabet;
        this.transitions = transitions;
        try {
            this.currentState = entryStateInitializer();
        } catch (err) {
            err.message = "State machine initialization on state \"" + this.currentState + "\" failed.\n" + err.message;
            console.log(err.message);
        }
        this.stateChangedCallback = stateChangedCallback;
        this.stateChangedCallback(this.currentState);
    }

    /**
     * @method makeTransition
     * @param word - the word from alphabet to make a corresponding transition
     * @param {...*} args - any type parameters for transition's action
     * @return {*} - action's returned value
     */
    StateMachine.prototype.makeTransition = function (word, args) {
        if (!this.alphabet.includes(word)) {
            throw new Error("word'" + word + "'doesn't belong to state machine's alphabet");
        }
        if (!this.transitions[word]) {
            throw new Error("The word '" + word + "' is redundant. There are no transitions for this word in state machine");
        }

        var self = this;
        var actionArgs = Array.prototype.slice.call(arguments, 1);
        var destinationSt;
        var action;
        this.transitions[word].forEach(function (tr) {
            if (tr.fromSt === self.currentState) {
                destinationSt = tr.toSt;
                action = tr.action;
            }
        });
        return action.apply(null, actionArgs)
            .then(function () {
                self.currentState = destinationSt;
                self.stateChangedCallback(self.currentState);
            })
            .fail(function (err) {
                err.message = "Unabled to perform an action before changing to state \"" + destinationSt + "\" in stateMachine\n" + err.message;
                console.log(err.message);
            });
    };

    window.StateMachine = StateMachine;
})();
