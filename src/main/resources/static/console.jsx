var B = ReactBootstrap;

class Console extends React.Component {
    constructor() {
        super();
        this.state = {
            baseUrl: "http://localhost:8080",
            mode: "categories"
        };
        this.handleSwitchMode = this.handleSwitchMode.bind(this);
    }

    handleSwitchMode(mode) {
        this.setState({ mode: mode });
    }

    render() {
        switch (this.state.mode) {
            case "categories":
                return (
                    <React.Fragment>
                        <Navbar onSwitchMode={this.handleSwitchMode} />
                        <CategoryConsole baseUrl={this.state.baseUrl} />
                    </React.Fragment>
                );
            case "items":
                return (
                    <React.Fragment>
                        <Navbar onSwitchMode={this.handleSwitchMode} />
                        <ItemConsole baseUrl={this.state.baseUrl} />
                    </React.Fragment>
                );
        }
    }
}

class Navbar extends React.Component {
    render() {
        return (
            <B.Navbar bg="dark" variant="dark">
                <B.Navbar.Brand>Console</B.Navbar.Brand>
                <B.Nav className="mr-auto">
                    <B.Nav.Link onClick={() => this.props.onSwitchMode("categories")}>Categories</B.Nav.Link>
                    <B.Nav.Link onClick={() => this.props.onSwitchMode("items")}>Items</B.Nav.Link>
                </B.Nav>
            </B.Navbar>
        );
    }
}

class CategoryConsole extends React.Component {
    constructor() {
        super();
        this.state = {
            categories: [],
            selectedCategory: { parent: {} },
            showAddModal: false,
            showEditModal: false,
            showDeleteModal: false
        }
        this.handleToggleAddModal = this.handleToggleAddModal.bind(this);
        this.handleToggleEditModal = this.handleToggleEditModal.bind(this);
        this.handleToggleDeleteModal = this.handleToggleDeleteModal.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.fetchData = this.fetchData.bind(this);
    }

    componentDidMount() {
        this.fetchData();
    }

    handleToggleAddModal(category) {
        this.setState({ showAddModal: !this.state.showAddModal, selectedCategory: category });
    }

    handleToggleEditModal(category) {
        this.setState({ showEditModal: !this.state.showEditModal, selectedCategory: category });
    }

    handleToggleDeleteModal(category) {
        this.setState({ showDeleteModal: !this.state.showDeleteModal, selectedCategory: category });
    }

    handleAdd(category) {
        fetch(this.props.baseUrl + "/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(category) })
            .then(this.fetchData);
        this.handleToggleAddModal({ parent: {} });
    }

    handleDelete(category) {
        fetch(this.props.baseUrl + "/categories/" + category.id, { method: "DELETE" })
            .then(this.fetchData);
        this.handleToggleDeleteModal({ parent: {} });
    }

    fetchData() {
        fetch(this.props.baseUrl + "/categories")
            .then(response => response.json())
            .then(categories => {
                categories.forEach(category => this.addParentProperty(category, true));
                return categories;
            })
            .then(categories => { this.setState({ categories: categories }) });
    }

    addParentProperty(category, isRoot) {
        if (isRoot) {
            category.parent = {};
        }
        if (category.children.length > 0) {
            category.children.forEach(child => {
                child.parent = category;
                this.addParentProperty(child, false);
            });
        }
    }

    render() {
        return (
            <React.Fragment>
                <CategoryList categories={this.state.categories} onAdd={this.handleToggleAddModal} onEdit={this.handleToggleEditModal} onDelete={this.handleToggleDeleteModal} />
                <AddModal show={this.state.showAddModal} parent={this.state.selectedCategory} onHide={this.handleToggleAddModal} onAdd={this.handleAdd} />
                <EditModal show={this.state.showEditModal} category={this.state.selectedCategory} categories={this.state.categories} onHide={this.handleToggleEditModal} />
                <DeleteModal show={this.state.showDeleteModal} category={this.state.selectedCategory} onHide={this.handleToggleDeleteModal} onDelete={this.handleDelete} />
            </React.Fragment>
        );
    }
}

class CategoryList extends React.Component {
    renderChildren(category, padding) {
        return (
            category.children.map(child =>
                <React.Fragment key={child.id}>
                    <B.ListGroup.Item style={{ paddingLeft: padding }}>
                        {child.name}
                        <ButtonGroup onAdd={this.props.onAdd} onEdit={this.props.onEdit} onDelete={this.props.onDelete} category={child} />
                    </B.ListGroup.Item>
                    {this.renderChildren(child, padding + 20)}
                </React.Fragment>)
        )
    }

    render() {
        return (
            <React.Fragment>
                <B.Button onClick={() => this.props.onAdd({ parent: {} })}>Add root</B.Button>
                <B.ListGroup>
                    {this.props.categories.map(category =>
                        <React.Fragment key={category.id}>
                            <B.ListGroup.Item>
                                {category.name}
                                <ButtonGroup onAdd={this.props.onAdd} onEdit={this.props.onEdit} onDelete={this.props.onDelete} category={category} />
                            </B.ListGroup.Item>
                            {this.renderChildren(category, 40)}
                        </React.Fragment>)}
                </B.ListGroup>
            </React.Fragment>
        );
    }
}

class ButtonGroup extends React.Component {
    render() {
        return (
            <React.Fragment>
                <B.Button variant="danger" size="sm" style={{ float: "right" }} disabled={this.props.category.children.length !== 0} onClick={() => this.props.onDelete(this.props.category)}>Delete</B.Button>
                <B.Button size="sm" style={{ float: "right", marginRight: 10 }} onClick={() => this.props.onEdit(this.props.category)}>Edit</B.Button>
                <B.Button size="sm" style={{ float: "right", marginRight: 10 }} onClick={() => this.props.onAdd(this.props.category)}>Add child</B.Button>
            </React.Fragment>
        );
    }
}

class AddModal extends React.Component {
    constructor() {
        super();
        this.state = { name: "" };
        this.handleChange = this.handleChange.bind(this);
        this.submitAndClear = this.submitAndClear.bind(this);
    }

    handleChange(event) {
        this.setState({ name: event.target.value });
    }

    submitAndClear() {
        if (this.props.parent.id == null) {
            this.props.onAdd({ name: this.state.name });
        } else {
            this.props.onAdd({ name: this.state.name, parent: { id: this.props.parent.id } });
        }
        this.setState({ name: "" });
    }

    renderChildren(category) {
        return (
            category.children.map(child =>
                <React.Fragment key={child.id}>
                    <option value={child.id}>{child.name}</option>
                    {this.renderChildren(child)}
                </React.Fragment>)
        );
    }

    render() {
        return (
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({ parent: {} })}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Add category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>
                    <B.Form>
                        <B.FormGroup>
                            <B.Form.Label>Name</B.Form.Label>
                            <B.Form.Control type="text" value={this.state.name} onChange={this.handleChange} />
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Parent</B.Form.Label>
                            <B.Form.Control plaintext readOnly defaultValue={this.props.parent.name}></B.Form.Control>
                        </B.FormGroup>
                    </B.Form>
                </B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide({ parent: {} })}>Cancel</B.Button>
                    <B.Button onClick={this.submitAndClear}>Save</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class EditModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    handleChange(event) {
        this.setState({ name: event.target.value });
    }

    renderChildren(category) {
        return (
            category.children.map(child =>
                <React.Fragment key={child.id}>
                    <option value={child.id}>{child.name}</option>
                    {this.renderChildren(child)}
                </React.Fragment>)
        );
    }

    render() {
        console.log(this.props.category.name)
        return (
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({ parent: {} })}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Edit category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>
                    <B.Form>
                        <B.FormGroup>
                            <B.Form.Label>Name</B.Form.Label>
                            <B.Form.Control type="text" name="name" value={this.state.name} onChange={this.handleChange} />
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Parent</B.Form.Label>
                            <B.Form.Control as="select" value={this.props.category.parent.id}>
                                <option></option>
                                {this.props.categories.map(category =>
                                    <React.Fragment key={category.id}>
                                        <option value={category.id}>{category.name}</option>
                                        {this.renderChildren(category)}
                                    </React.Fragment>)}
                            </B.Form.Control>
                        </B.FormGroup>
                    </B.Form>
                </B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide({ parent: {} })}>Cancel</B.Button>
                    <B.Button>Save</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class DeleteModal extends React.Component {
    render() {
        return (
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({ parent: {} })}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Delete category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>Are you sure you want to delete the "{this.props.category.name}" category?</B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide({ parent: {} })}>Cancel</B.Button>
                    <B.Button variant="danger" onClick={() => this.props.onDelete(this.props.category)}>Delete</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class ItemConsole extends React.Component {
    render() {
        return (
            <React.Fragment>
                <ItemTable baseUrl={this.props.baseUrl} />
            </React.Fragment>
        );
    }
}

class ItemTable extends React.Component {
    constructor() {
        super();
        this.state = { items: [] };
    }

    componentDidMount() {
        fetch(this.props.baseUrl + "/items")
            .then(response => response.json())
            .then(items => this.setState({ items: items }));
    }

    render() {
        console.log(this.state.items)
        return (
            <B.Table>
                <thead>
                    <tr>
                        <th>Brand</th>
                        <th>Name</th>
                        <th>EAN</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.items.map(item =>
                        <tr key={item.id}>
                            <td>{item.brand.name}</td>
                            <td>{item.name}</td>
                            <td>{item.ean}</td>
                            <td>{item.category.name}</td>
                            <td>
                                <B.Button variant="danger" size="sm" style={{ float: "right" }}>Delete</B.Button>
                                <B.Button size="sm" style={{ float: "right", marginRight: 10 }}>Edit</B.Button>
                            </td>
                        </tr>)}
                </tbody>
            </B.Table>
        );
    }
}

ReactDOM.render(<Console />, document.getElementById("container"));