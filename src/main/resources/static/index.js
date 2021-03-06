const B = ReactBootstrap;
const url = "http://localhost:8080";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            section: "Categories",
            categories: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSwitch = this.handleSwitch.bind(this);
    }

    componentDidMount() {
        this.fetchCategories();
    }

    fetchCategories() {
        fetch(url + "/categories")
            .then(response => response.json())
            .then(categories => {
                categories.forEach(category => this.addParent(category, true));
                return categories;
            })
            .then(categories => { this.setState({ categories: categories }) });
    }

    addParent(category, isRoot) {
        if (isRoot) {
            category.parent = { id: 0 };
        }
        if (category.children.length > 0) {
            category.children.forEach(child => {
                child.parent = category;
                this.addParent(child, false);
            });
        }
    }

    handleChange() {
        this.fetchCategories();
    }

    handleSwitch(section) {
        this.setState({ section: section });
    }

    render() {
        let console;
        switch (this.state.section) {
            case "Categories":
                console = <CategoryConsole categories={this.state.categories} onChange={this.handleChange} />;
                break;
            case "Items":
                console = <ItemConsole categories={this.state.categories} onChange={this.handleChange} />;
        }
        return (
            <React.Fragment>
                <Navbar links={["Categories", "Items"]} section={this.state.section} onSwitch={this.handleSwitch} />
                {console}
            </React.Fragment>
        );
    }
}

class Navbar extends React.Component {
    render() {
        return (
            <B.Navbar bg="dark" variant="dark" expand="lg">
                <B.Navbar.Brand>
                    <img
                    	alt=""
                        src="/logo.png"
                        height="30"
                    />
                </B.Navbar.Brand>
                <B.Navbar.Toggle />
                <B.Navbar.Collapse>
                    <B.Nav className="mr-auto">
                        {this.props.links.map((link) =>
                            <B.Nav.Link key={link} active={link === this.props.section} onClick={() => this.props.onSwitch(link)}>{link}</B.Nav.Link>)}
                    </B.Nav>
                </B.Navbar.Collapse>
            </B.Navbar>
        );
    }
}

class CategoryConsole extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categoryId: 0,
            categoryName: "",
            categoryParent: {},
            categoryParentId: 0,
            showAddModal: false,
            showEditModal: false,
            showDeleteModal: false
        }
        this.handleToggleAddModal = this.handleToggleAddModal.bind(this);
        this.handleToggleEditModal = this.handleToggleEditModal.bind(this);
        this.handleToggleDeleteModal = this.handleToggleDeleteModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleToggleAddModal(parent) {
        this.setState(state => ({
            showAddModal: !state.showAddModal,
            categoryName: "",
            categoryParent: parent
        }));
    }

    handleToggleEditModal(category) {
        this.setState(state => ({
            showEditModal: !state.showEditModal,
            categoryId: category.id,
            categoryName: category.name,
            categoryParentId: category.parent.id
        }));
    }

    handleToggleDeleteModal(category) {
        this.setState(state => ({
            showDeleteModal: !state.showDeleteModal,
            categoryId: category.id,
            categoryName: category.name
        }));
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleAdd() {
        let category = { name: this.state.categoryName };
        if (this.state.categoryParent.id) {
            category.parent = {};
            category.parent.id = this.state.categoryParent.id;
        }
        fetch(url + "/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(category) })
            .then(this.props.onChange);
        this.handleToggleAddModal({});
    }

    handleEdit() {
        let category = { name: this.state.categoryName, parent: {} };
        if (this.state.categoryParentId != 0) {
            category.parent.id = this.state.categoryParentId;
        }
        fetch(url + "/categories/" + this.state.categoryId, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(category) })
            .then(this.props.onChange);
        this.handleToggleEditModal({ id: 0, name: "", parent: {} });
    }

    handleDelete() {
        fetch(url + "/categories/" + this.state.categoryId, { method: "DELETE" })
            .then(this.props.onChange);
        this.handleToggleDeleteModal({ id: 0, name: "" });
    }

    render() {
        return (
            <B.Container fluid>
                <B.Row>
                    <B.Col className="mt-3">
                        <B.Button onClick={() => this.handleToggleAddModal({})}>
                            <i className="fas fa-plus"></i>
                        </B.Button>
                    </B.Col>
                </B.Row>
                <B.Row>
                    <B.Col className="mt-3">
                        <CategoryList
                            categories={this.props.categories}
                            onAdd={this.handleToggleAddModal}
                            onEdit={this.handleToggleEditModal}
                            onDelete={this.handleToggleDeleteModal} />
                    </B.Col>
                </B.Row>
                <AddCategoryModal
                    show={this.state.showAddModal}
                    categoryName={this.state.categoryName}
                    categoryParent={this.state.categoryParent}
                    onChange={this.handleChange}
                    onHide={this.handleToggleAddModal}
                    onSubmit={this.handleAdd} />
                <EditCategoryModal
                    show={this.state.showEditModal}
                    categoryName={this.state.categoryName}
                    categoryParentId={this.state.categoryParentId}
                    categories={this.props.categories}
                    onChange={this.handleChange}
                    onHide={this.handleToggleEditModal}
                    onSubmit={this.handleEdit} />
                <DeleteCategoryModal
                    show={this.state.showDeleteModal}
                    categoryName={this.state.categoryName}
                    onHide={this.handleToggleDeleteModal}
                    onSubmit={this.handleDelete} />
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
                <B.Button
                    variant="outline-danger"
                    size="sm"
                    style={{ float: "right" }}
                    disabled={this.props.category.children.length !== 0}
                    onClick={() => this.props.onDelete(this.props.category)}>
                    <i className="fas fa-trash"></i>    
                </B.Button>
                <B.Button
                    variant="outline-primary"
                    size="sm"
                    style={{ float: "right", marginRight: 10 }}
                    onClick={() => this.props.onEdit(this.props.category)}>
                    <i className="fas fa-pen"></i>    
                </B.Button>
                <B.Button
                    variant="outline-primary"
                    size="sm"
                    style={{ float: "right", marginRight: 10 }}
                    onClick={() => this.props.onAdd(this.props.category)}>
                    <i className="fas fa-plus"></i>
                </B.Button>
            </React.Fragment>
        );
    }
}

class AddCategoryModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { validated: false }
        this.handleChange = this.handleChange.bind(this);
        this.handleHide = this.handleHide.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.props.onChange(event);
    }

    handleHide() {
        this.setState({ validated: false });
        this.props.onHide({});
    }

    handleSubmit() {
        if (document.getElementById("addCategoryForm").checkValidity()) {
            this.props.onSubmit();
        } else {
            this.setState({ validated: true });
        }
    }

    render() {
        return (
            <B.Modal show={this.props.show} onHide={this.handleHide}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Add category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>
                    <B.Form id="addCategoryForm" noValidate validated={this.state.validated}>
                        <B.FormGroup>
                            <B.Form.Label>Name</B.Form.Label>
                            <B.Form.Control type="text" name="categoryName" value={this.props.categoryName} onChange={this.handleChange} required />
                            <B.Form.Control.Feedback type="invalid">
                                Please insert a name
                            </B.Form.Control.Feedback>
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Parent</B.Form.Label>
                            <B.Form.Control plaintext readOnly defaultValue={this.props.categoryParent.name}></B.Form.Control>
                        </B.FormGroup>
                    </B.Form>
                </B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={this.handleHide}>Cancel</B.Button>
                    <B.Button onClick={this.handleSubmit}>Save</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class EditCategoryModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { valid: false }
        this.handleChange = this.handleChange.bind(this);
        this.handleHide = this.handleHide.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.props.onChange(event);
    }

    handleHide() {
        this.setState({ validated: false });
        this.props.onHide({});
    }

    handleSubmit() {
        if (document.getElementById("editCategoryForm").checkValidity()) {
            this.props.onSubmit();
        } else {
            this.setState({ validated: true });
        }
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
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({ id: 0, name: "", parent: {} })}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Edit category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>
                    <B.Form id="editCategoryForm" noValidate validated={this.state.validated}>
                        <B.FormGroup>
                            <B.Form.Label>Name</B.Form.Label>
                            <B.Form.Control type="text" name="categoryName" value={this.props.categoryName} onChange={this.handleChange} required />
                            <B.Form.Control.Feedback type="invalid">
                                Please insert a name
                            </B.Form.Control.Feedback>
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Parent</B.Form.Label>
                            <B.Form.Control as="select" name="categoryParentId" value={this.props.categoryParentId} onChange={this.handleChange}>
                                <option value="0"></option>
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
                    <B.Button onClick={() => this.props.onHide({ id: 0, name: "", parent: {} })}>Cancel</B.Button>
                    <B.Button onClick={this.handleSubmit}>Save</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class DeleteCategoryModal extends React.Component {
    render() {
        return (
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({ id: 0, name: "" })}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Delete category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>Are you sure you want to delete "{this.props.categoryName}"?</B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide({ id: 0, name: "" })}>Cancel</B.Button>
                    <B.Button variant="danger" onClick={this.props.onSubmit}>Delete</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class ItemConsole extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            currencies: [],
            itemId: 0,
            itemBrandName: "",
            itemName: "",
            itemPriceInEur: "",
            itemPriceInUsd: "",
            itemEan: "",
            itemImageUrl: "",
            itemCategoryId: 0,
            showAddModal: false,
            showDeleteModal: false
        }
        this.fetchItems = this.fetchItems.bind(this);
        this.handleToggleAddModal = this.handleToggleAddModal.bind(this);
        this.handleToggleEditModal = this.handleToggleEditModal.bind(this);
        this.handleToggleDeleteModal = this.handleToggleDeleteModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        this.fetchItems();
    }

    fetchItems() {
        fetch(url + "/items")
            .then(response => response.json())
            .then(items => this.setState({ items: items }));
    }

    setItemState(item) {
        if (item !== undefined) {
            this.setState({
                itemId: item.id,
                itemBrandName: item.brand.name,
                itemName: item.name,
                itemPriceInEur: this.findPriceByCurrency(item.prices, "EUR"),
                itemPriceInUsd: this.findPriceByCurrency(item.prices, "USD"),
                itemEan: item.ean,
                itemImageUrl: item.imageUrl,
                itemCategoryId: item.category.id
            })
        } else {
            this.setState({
                itemId: 0,
                itemBrandName: "",
                itemName: "",
                itemPriceInEur: "",
                itemPriceInUsd: "",
                itemEan: "",
                itemImageUrl: "",
                itemCategoryId: 0
            })
        }
    }

    handleToggleAddModal() {
        this.setItemState();
        this.setState(state => ({ showAddModal: !state.showAddModal, }));
    }

    handleToggleEditModal(item) {
        this.setItemState(item);
        this.setState(state => ({ showEditModal: !state.showEditModal }));
    }

    findPriceByCurrency(prices, currency) {
        let price = prices.find((price) => {
            return price.currency === currency;
        });
        return price !== undefined ? price.value : "";
    }

    handleToggleDeleteModal(item) {
        this.setState(state => ({
            showDeleteModal: !state.showDeleteModal,
            itemId: item.id,
            itemBrandName: item.brand.name,
            itemName: item.name
        }));
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleAdd() {
        let item = {
            brand: {
                name: this.state.itemBrandName
            },
            prices: [{ value: this.state.itemPriceInEur, currency: "EUR" }],
            name: this.state.itemName,
            ean: this.state.itemEan,
            imageUrl: this.state.itemImageUrl,
            category: {
                id: this.state.itemCategoryId
            }
        };
        if (this.state.itemPriceInUsd !== "") {
            item.prices.push({ value: this.state.itemPriceInUsd, currency: "USD" });
        }
        fetch(url + "/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) })
            .then(this.fetchItems);
        this.handleToggleAddModal();
    }

    handleEdit() {
        let item = {
            brand: {
                name: this.state.itemBrandName
            },
            prices: [{ value: this.state.itemPriceInEur, currency: "EUR" }],
            name: this.state.itemName,
            ean: this.state.itemEan,
            imageUrl: this.state.itemImageUrl,
            category: {
                id: this.state.itemCategoryId
            }
        }
        if (this.state.itemPriceInUsd !== "") {
            item.prices.push({ value: this.state.itemPriceInUsd, currency: "USD" });
        }
        fetch(url + "/items/" + this.state.itemId, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) })
            .then(this.fetchItems);
        this.handleToggleEditModal();
    }

    handleDelete() {
        fetch(url + "/items/" + this.state.itemId, { method: "DELETE" })
            .then(this.fetchItems);
        this.handleToggleDeleteModal({ id: 0, brand: { name: "" }, name: "" });
    }

    render() {
        return (
            <B.Container fluid>
                <B.Row>
                    <B.Col className="mt-3">
                        <B.Button onClick={this.handleToggleAddModal}>
                            <i className="fas fa-plus"></i>
                        </B.Button>
                    </B.Col>
                </B.Row>
                <B.Row>
                    <B.Col className="mt-3">
                        <ItemTable items={this.state.items} onEdit={this.handleToggleEditModal} onDelete={this.handleToggleDeleteModal} />
                    </B.Col>
                </B.Row>
                <AddItemModal
                    show={this.state.showAddModal}
                    itemBrandName={this.state.itemBrandName}
                    itemName={this.state.itemName}
                    itemPriceInEur={this.state.itemPriceInEur}
                    itemPriceInUsd={this.state.itemPriceInUsd}
                    itemEan={this.state.itemEan}
                    itemImageUrl={this.state.itemImageUrl}
                    itemCategoryId={this.state.itemCategoryId}
                    categories={this.props.categories}
                    onChange={this.handleChange}
                    onSubmit={this.handleAdd}
                    onHide={this.handleToggleAddModal} />
                <EditItemModal
                    show={this.state.showEditModal}
                    itemBrandName={this.state.itemBrandName}
                    itemName={this.state.itemName}
                    itemPriceInEur={this.state.itemPriceInEur}
                    itemPriceInUsd={this.state.itemPriceInUsd}
                    itemEan={this.state.itemEan}
                    itemImageUrl={this.state.itemImageUrl}
                    itemCategoryId={this.state.itemCategoryId}
                    categories={this.props.categories}
                    onChange={this.handleChange}
                    onSubmit={this.handleEdit}
                    onHide={this.handleToggleEditModal} />
                <DeleteItemModal
                    show={this.state.showDeleteModal}
                    itemBrandName={this.state.itemBrandName}
                    itemName={this.state.itemName}
                    onHide={this.handleToggleDeleteModal}
                    onSubmit={this.handleDelete} />
            </B.Container>
        );
    }
}

class ItemTable extends React.Component {
    render() {
        return (
            <B.Table responsive>
                <thead>
                    <tr>
                        <th>Brand</th>
                        <th>Name</th>
                        <th>EAN</th>
                        <th>Image URL</th>
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
                            <td>{item.imageUrl}</td>
                            <td>{item.category.name}</td>
                            <td style={{ whiteSpace: "nowrap", width: "0" }}>
                                <B.Button variant="outline-primary" size="sm" style={{ marginRight: 10 }} onClick={() => this.props.onEdit(item)}>
                                    <i className="fas fa-pen"></i>    
                                </B.Button>
                                <B.Button variant="outline-danger" size="sm" onClick={() => this.props.onDelete(item)}>
                                    <i className="fas fa-trash"></i>
                                </B.Button>
                            </td>
                        </tr>)}
                </tbody>
            </B.Table>
        );
    }
}

class AddItemModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { validated: false }
        this.handleChange = this.handleChange.bind(this);
        this.handleHide = this.handleHide.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.props.onChange(event);
    }

    handleHide() {
        this.setState({ validated: false });
        this.props.onHide();
    }

    handleSubmit() {
        if (document.getElementById("addItemForm").checkValidity()) {
            this.props.onSubmit();
        } else {
            this.setState({ validated: true });
        }
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
            <B.Modal show={this.props.show} onHide={this.handleHide}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Add item</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>
                    <B.Form id="addItemForm" noValidate validated={this.state.validated}>
                        <B.FormGroup>
                            <B.Form.Label>Brand</B.Form.Label>
                            <B.Form.Control type="text" name="itemBrandName" value={this.props.itemBrandName} onChange={this.handleChange} required />
                            <B.Form.Control.Feedback type="invalid">
                                Please insert a brand
                            </B.Form.Control.Feedback>
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Name</B.Form.Label>
                            <B.Form.Control type="text" name="itemName" value={this.props.itemName} onChange={this.handleChange} required />
                            <B.Form.Control.Feedback type="invalid">
                                Please insert a name
                            </B.Form.Control.Feedback>
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Price</B.Form.Label>
                            <B.Form.Row className="mb-2">
                                <B.Col>
                                    <B.Form.Control type="text" className="text-right" name="itemPriceInEur" value={this.props.itemPriceInEur} onChange={this.handleChange} required pattern="\d+(\.\d+)?" />
                                    <B.Form.Control.Feedback type="invalid">
                                        Please insert a valid price
                                    </B.Form.Control.Feedback>
                                </B.Col>
                                <B.Col>
                                    <B.Form.Control plaintext readOnly defaultValue="EUR" />
                                </B.Col>
                            </B.Form.Row>
                            <B.Form.Row>
                                <B.Col>
                                    <B.Form.Control type="text" className="text-right" name="itemPriceInUsd" value={this.props.itemPriceInUsd} onChange={this.handleChange} pattern="\d+(\.\d+)?" />
                                    <B.Form.Control.Feedback type="invalid">
                                        Please insert a valid price or leave the field empty
                                    </B.Form.Control.Feedback>
                                </B.Col>
                                <B.Col>
                                    <B.Form.Control plaintext readOnly defaultValue="USD" />
                                </B.Col>
                            </B.Form.Row>
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>EAN</B.Form.Label>
                            <B.Form.Control type="text" name="itemEan" value={this.props.itemEan} onChange={this.handleChange} required pattern="\d{13}" />
                            <B.Form.Control.Feedback type="invalid">
                                Please insert a valid EAN-13
                            </B.Form.Control.Feedback>
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Image URL</B.Form.Label>
                            <B.Form.Control type="text" name="itemImageUrl" value={this.props.itemImageUrl} onChange={this.handleChange} required />
                            <B.Form.Control.Feedback type="invalid">
                                Please insert a name
                            </B.Form.Control.Feedback>
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Category</B.Form.Label>
                            <B.Form.Control as="select" name="itemCategoryId" value={this.props.itemCategoryId} onChange={this.handleChange} required>
                                <option></option>
                                {this.props.categories.map(category =>
                                    <React.Fragment key={category.id}>
                                        <option value={category.id}>{category.name}</option>
                                        {this.renderChildren(category)}
                                    </React.Fragment>)}
                            </B.Form.Control>
                            <B.Form.Control.Feedback type="invalid">
                                Please select a category
                            </B.Form.Control.Feedback>
                        </B.FormGroup>
                    </B.Form>
                </B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={this.handleHide}>Cancel</B.Button>
                    <B.Button onClick={this.handleSubmit}>Save</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class EditItemModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { validated: false }
        this.handleChange = this.handleChange.bind(this);
        this.handleHide = this.handleHide.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.props.onChange(event);
    }

    handleHide() {
        this.setState({ validated: false });
        this.props.onHide();
    }

    handleSubmit() {
        if (document.getElementById("editItemForm").checkValidity()) {
            this.props.handleSubmit();
        } else {
            this.setState({ validated: true })
        }
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
            <B.Modal show={this.props.show} onHide={this.handleHide}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Edit item</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>
                    <B.Form id="editItemForm" noValidate validated={this.state.validated}>
                        <B.FormGroup>
                            <B.Form.Label>Brand</B.Form.Label>
                            <B.Form.Control type="text" name="itemBrandName" value={this.props.itemBrandName} onChange={this.handleChange} required />
                            <B.Form.Control.Feedback type="invalid">
                                Please insert a brand
                            </B.Form.Control.Feedback>
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Name</B.Form.Label>
                            <B.Form.Control type="text" name="itemName" value={this.props.itemName} onChange={this.handleChange} required />
                            <B.Form.Control.Feedback type="invalid">
                                Please insert a name
                            </B.Form.Control.Feedback>
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Price</B.Form.Label>
                            <B.Form.Row className="mb-2">
                                <B.Col>
                                    <B.Form.Control type="text" className="text-right" name="itemPriceInEur" value={this.props.itemPriceInEur} onChange={this.handleChange} required pattern="\d+(\.\d+)?" />
                                    <B.Form.Control.Feedback type="invalid">
                                        Please insert a valid price
                                    </B.Form.Control.Feedback>
                                </B.Col>
                                <B.Col>
                                    <B.Form.Control plaintext readOnly defaultValue="EUR" />
                                </B.Col>
                            </B.Form.Row>
                            <B.Form.Row>
                                <B.Col>
                                    <B.Form.Control type="text" className="text-right" name="itemPriceInUsd" value={this.props.itemPriceInUsd} onChange={this.handleChange} pattern="\d+(\.\d+)?" />
                                    <B.Form.Control.Feedback type="invalid">
                                        Please insert a valid price or leave the field empty
                                    </B.Form.Control.Feedback>
                                </B.Col>
                                <B.Col>
                                    <B.Form.Control plaintext readOnly defaultValue="USD" />
                                </B.Col>
                            </B.Form.Row>
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>EAN</B.Form.Label>
                            <B.Form.Control type="text" name="itemEan" value={this.props.itemEan} onChange={this.handleChange} required pattern="\d{13}" />
                            <B.Form.Control.Feedback type="invalid">
                                Please insert a valid EAN-13
                            </B.Form.Control.Feedback>
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Image URL</B.Form.Label>
                            <B.Form.Control type="text" name="itemImageUrl" value={this.props.itemImageUrl} onChange={this.handleChange} required />
                            <B.Form.Control.Feedback type="invalid">
                                Please insert a name
                            </B.Form.Control.Feedback>
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Category</B.Form.Label>
                            <B.Form.Control as="select" name="itemCategoryId" value={this.props.itemCategoryId} onChange={this.handleChange}>
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
                    <B.Button onClick={this.handleHide}>Cancel</B.Button>
                    <B.Button onClick={this.handleSubmit}>Save</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class DeleteItemModal extends React.Component {
    render() {
        return (
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({ id: 0, brand: { name: "" }, name: "" })}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Delete item</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>Are you sure you want to delete "{this.props.itemBrandName} {this.props.itemName}"?</B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide({ id: 0, brand: { name: "" }, name: "" })}>Cancel</B.Button>
                    <B.Button variant="danger" onClick={this.props.onSubmit}>Delete</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

ReactDOM.render(<App />, document.getElementById("container"));