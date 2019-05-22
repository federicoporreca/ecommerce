var B = ReactBootstrap;

class Console extends React.Component {
    constructor() {
        super();
        this.state = {
            baseUrl: "http://localhost:8080",
            mode: "items"
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
            showAddCategoryModal: false,
            showEditCategoryModal: false,
            showDeleteCategoryModal: false
        }
        this.handleToggleAddCategoryModal = this.handleToggleAddCategoryModal.bind(this);
        this.handleToggleEditCategoryModal = this.handleToggleEditCategoryModal.bind(this);
        this.handleToggleDeleteCategoryModal = this.handleToggleDeleteCategoryModal.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.fetchData = this.fetchData.bind(this);
    }

    componentDidMount() {
        this.fetchData();
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

    handleToggleAddCategoryModal(category) {
        this.setState({ showAddCategoryModal: !this.state.showAddCategoryModal, selectedCategory: category });
    }

    handleToggleEditCategoryModal(category) {
        this.setState({ showEditCategoryModal: !this.state.showEditCategoryModal, selectedCategory: category });
    }

    handleToggleDeleteCategoryModal(category) {
        this.setState({ showDeleteCategoryModal: !this.state.showDeleteCategoryModal, selectedCategory: category });
    }

    handleAdd(category) {
        fetch(this.props.baseUrl + "/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(category) })
            .then(this.fetchData);
        this.handleToggleAddCategoryModal({ parent: {} });
    }

    handleDelete(category) {
        fetch(this.props.baseUrl + "/categories/" + category.id, { method: "DELETE" })
            .then(this.fetchData);
        this.handleToggleDeleteCategoryModal({ parent: {} });
    }

    render() {
        return (
            <B.Container fluid>
                <B.Row>
                    <B.Col className="mt-3">
                        <B.Button onClick={() => this.handleToggleAddCategoryModal({ parent: {} })}>Add root</B.Button>
                    </B.Col>
                </B.Row>
                <B.Row>
                    <B.Col className="mt-3">
                        <CategoryList categories={this.state.categories} onAdd={this.handleToggleAddCategoryModal} onEdit={this.handleToggleEditCategoryModal} onDelete={this.handleToggleDeleteCategoryModal} />
                    </B.Col>
                </B.Row>
                <AddCategoryModal show={this.state.showAddCategoryModal} parent={this.state.selectedCategory} onHide={this.handleToggleAddCategoryModal} onAdd={this.handleAdd} />
                <EditCategoryModal show={this.state.showEditCategoryModal} category={this.state.selectedCategory} categories={this.state.categories} onHide={this.handleToggleEditCategoryModal} />
                <DeleteCategoryModal show={this.state.showDeleteCategoryModal} category={this.state.selectedCategory} onHide={this.handleToggleDeleteCategoryModal} onDelete={this.handleDelete} />
            </B.Container>
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

class AddCategoryModal extends React.Component {
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

class EditCategoryModal extends React.Component {
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

class DeleteCategoryModal extends React.Component {
    render() {
        return (
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({ parent: {} })}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Delete category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>Are you sure you want to delete "{this.props.category.name}"?</B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide({ parent: {} })}>Cancel</B.Button>
                    <B.Button variant="danger" onClick={() => this.props.onDelete(this.props.category)}>Delete</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class ItemConsole extends React.Component {
    constructor() {
        super();
        this.state = {
            items: [],
            selectedItem: { brand: {} },
            showAddItemModal: false,
            showDeleteItemModal: false
        }
        this.handleToggleAddItemModal = this.handleToggleAddItemModal.bind(this);
        this.handleToggleDeleteItemModal = this.handleToggleDeleteItemModal.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        fetch(this.props.baseUrl + "/items")
            .then(response => response.json())
            .then(items => this.setState({ items: items }));
    }

    handleToggleAddItemModal() {
        this.setState({ showAddItemModal: !this.state.showAddItemModal });
    }

    handleToggleDeleteItemModal(item) {
        this.setState({ showDeleteItemModal: !this.state.showDeleteItemModal, selectedItem: item });
    }

    handleDelete(item) {
        fetch(this.props.baseUrl + "/items/" + item.id, { method: "DELETE" })
            .then(this.fetchData);
        this.handleToggleDeleteItemModal({ brand: {} });
    }

    render() {
        return (
            <B.Container fluid>
                <B.Row>
                    <B.Col className="mt-3">
                        <B.Button onClick={this.handleToggleAddItemModal}>Add</B.Button>
                    </B.Col>
                </B.Row>
                <B.Row>
                    <B.Col className="mt-3">
                        <ItemTable items={this.state.items} onDelete={this.handleToggleDeleteItemModal} />
                    </B.Col>
                </B.Row>
                <AddItemModal show={this.state.showAddItemModal} onHide={this.handleToggleAddItemModal}></AddItemModal>
                <DeleteItemModal show={this.state.showDeleteItemModal} item={this.state.selectedItem} onHide={this.handleToggleDeleteItemModal} onDelete={this.handleDelete}></DeleteItemModal>
            </B.Container>
        );
    }
}

class ItemTable extends React.Component {
    render() {
        return (
            <B.Table>
                <thead>
                    <tr>
                        <th>Brand</th>
                        <th>Name</th>
                        <th>EAN</th>
                        <th>Category</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.items.map(item =>
                        <tr key={item.id}>
                            <td>{item.brand.name}</td>
                            <td>{item.name}</td>
                            <td>{item.ean}</td>
                            <td>{item.category.name}</td>
                            <td style={{ whiteSpace: "nowrap", width: "0" }}>
                                <B.Button size="sm" style={{ marginRight: 10 }}>Edit</B.Button>
                                <B.Button variant="danger" size="sm" onClick={() => this.props.onDelete(item)}>Delete</B.Button>
                            </td>
                        </tr>)}
                </tbody>
            </B.Table>
        );
    }
}

class AddItemModal extends React.Component {
    render() {
        return (
            <B.Modal show={this.props.show} onHide={this.props.onHide}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Add item</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body></B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={this.props.onHide}>Cancel</B.Button>
                    <B.Button>Save</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class DeleteItemModal extends React.Component {
    render() {
        console.log(this.props.item)
        return (
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({ brand: {} })}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Delete item</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>Are you sure you want to delete "{this.props.item.brand.name} {this.props.item.name}"?</B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide({ brand: {} })}>Cancel</B.Button>
                    <B.Button variant="danger" onClick={() => this.props.onDelete(this.props.item)}>Delete</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

ReactDOM.render(<Console />, document.getElementById("container"));