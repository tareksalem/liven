import { Activejs, Component } from '../../Activejs';


class HomePage extends Component {
    constructor(props) {
        super(props);
        this.$store = {
            message: "hello home page"
        }
    }
}

new HomePage({ parent: ".app", uniqueName: "homepage" }).init();