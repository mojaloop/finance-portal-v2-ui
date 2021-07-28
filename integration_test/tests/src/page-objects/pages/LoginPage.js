import {Selector} from 'testcafe'

class LoginPage {
    constructor() {
        this.userName = Selector(".mb-input__content.input-textfield__content input[type=text]");
        this.password = Selector(".mb-input__content.input-textfield__content input[type=password]");
        this.submitButton = Selector(".login__submit");

    }

}

module.exports = new LoginPage();
