import React, { Component } from 'react';
import './products.css';

import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import InboxIcon from '@material-ui/icons/Inbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import Button from '@material-ui/core/Button';

import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

const useStyles = makeStyles(theme => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }));


class Products extends Component {

    constructor(props){
        super(props);

        this.state = { 
            productList: null,
            showList: true,
            selectedProductId: null,
            selectedProduct: null,
            qty: 0,
            message: ''
        };

        this.handleAddToCart = this.handleAddToCart.bind(this);
        this.handleViewDetails = this.handleViewDetails.bind(this);
        this.handleViewList = this.handleViewList.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        fetch('https://mybillfunctionapp2.azurewebsites.net/api/GetAllProducts')
            .then(response => response.json())
            .then(data => this.setState( { productList: data }))
            .catch(function(err) {
                console.log(err);
            });
    }


    handleAddToCart() {
        console.log(this.state.selectedProduct.Id + ' -- ' + this.state.qty);
  
        let currentComponent = this;
        const productId = this.state.selectedProduct.Id;
        const qty = this.state.qty;

        fetch(`https://mybillfunctionapp2.azurewebsites.net/api/AddItemToCart?productId=${productId}&quantity=${qty}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              }
        })
        .then(result => result.text())
        .then(function(data) {
            console.log(data);
            currentComponent.setState( { message: 'Product added!' });  
            this.props.onClick();
        }.bind(this))
        .catch(function(err) {
            console.log('Error adding product to cart');
            console.log(err);
            currentComponent.setState( { message: 'Error adding product to cart' });
        }.bind(this));;

    }


    handleViewList() {
        this.setState( 
            { 
                selectedProductId: null, 
                showList: true,
                message: ''
            });
    }

    handleChange(evt) {
        const value = evt.currentTarget.value;

        this.setState( { qty: value });
    }

    handleViewDetails(evt) {
        const target = evt.currentTarget;
        const name = target.name;
        const value = target.value;
  
        const tmpSelectedProduct = this.state.productList.filter((p) => p.Id == value)[0];

        this.setState( 
            { 
                selectedProductId: value,
                showList: false,
                selectedProduct: tmpSelectedProduct,
                qty: 1
            }
        );
    }



    render() {
        let items = this.state.productList;


        return (
            <div>
                {
                    this.state.showList ? 
                    items && items.map(
                        (pl) =>
                        <div  >
                            <img className="smallImage"
                                src={require(`./images/${pl.ImageName}`)}
                                alt={pl.Name}
                            />
                            <br />
                            <h3>{pl.Name}</h3>
                            <Button variant="contained" color="default" value={pl.Id} onClick={this.handleViewDetails}   className="addButton">
                                View Details
                            </Button>
                            <Divider className="customProductDivider"/>
                        </div>
                    ) 
                    :
                    <div>
                        <Button variant="contained" color="default" onClick={this.handleViewList}  className="addButton">
                            Back to List
                        </Button>
                        <br />
                        <img className="smallImage"
                                src={require(`./images/${this.state.selectedProduct.ImageName}`)}
                                alt={this.state.selectedProduct.Name}
                            />
                            <br />
                            <h3>{this.state.selectedProduct.Name}</h3>
                            <br />
                            <p>{this.state.selectedProduct.Description}</p>
                        <br />
                        <Button variant="contained" color="primary" onClick={this.handleAddToCart} className="addButton">
                                Add to Cart 
                        </Button>
                        
                        <FormControl>
                            <InputLabel htmlFor="qty-native-simple">Qty</InputLabel>
                            <Select
                            native
                            value={this.state.qty}
                            onChange={this.handleChange}
                            inputProps={{
                                name: 'qty',
                                id: 'qty-native-simple',
                            }}
                            >
                            
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            </Select>
                        </FormControl>
                        <br />
                        <h4>{this.state.message}</h4>
                    </div>
                }  
            </div>
        )

    }

}

export default Products;