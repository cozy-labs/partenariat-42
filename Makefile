BIN = ./node_modules/.bin

LINT_RULES = --indent 2 --maxlen 80 --nomen --sloppy --unparam
lint:
	find client/app -name "*.js" -print0 | xargs -0 node $(BIN)/jslint $(LINT_RULES) --browser --predef $$ --predef Backbone --predef _
	find server -name "*.js" -print0 | xargs -0 node $(BIN)/jslint $(LINT_RULES) --node --predef emit --predef sum

test:
	@$(BIN)/mocha ./tests --report spec --require should --colors
