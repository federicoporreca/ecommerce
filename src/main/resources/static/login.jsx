const B = ReactBootstrap;

class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            username: "",
            password: ""
        }
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    render() {
        return (
            <B.Container className="h-100">
                <B.Row className="h-100 justify-content-center align-items-center">
                    <B.Col xs="auto">
                        <B.Image src="/logo.png" width="100" style={{ display: "block" }} className="mx-auto my-3" />
                        <B.Form>
                            <B.Form.Group>
                                <B.Form.Label>Username</B.Form.Label>
                                <B.Form.Control type="text" name="username" value={this.state.username} onChange={this.handleChange} />
                            </B.Form.Group>
                            <B.Form.Group>
                                <B.Form.Label>Password</B.Form.Label>
                                <B.Form.Control type="password" name="password" value={this.state.password} onChange={this.handleChange} />
                            </B.Form.Group>
                            <B.Button variant="primary" type="submit">
                                Login
                            </B.Button>
                        </B.Form>
                    </B.Col>
                </B.Row>
            </B.Container>
        )
    }
}

ReactDOM.render(<Login />, document.getElementById("container"));