import React, { Component } from 'react';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import './Cart.css';


import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';

import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

class Cart extends Component {
    

    constructor(props) {
        super(props);
        

        this.state = 
        {
            productsInCart: null,
            message: '',
            subTotal: 0.00,
            grandTotal: 0.00,
            calculatedTax: 0.00,
            hasPurchased: false,
            qty: 0,
            hash: {}
        };

        this.handleBackToListClick = this.handleBackToListClick.bind(this);
        this.getProductsInCart = this.getProductsInCart.bind(this);
        this.handleRemoveFromCart = this.handleRemoveFromCart.bind(this);
        this.handlePurchaseClick = this.handlePurchaseClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.hanldeUpdateQuantity = this.hanldeUpdateQuantity.bind(this);

        const useStyles = makeStyles(theme => ({
            root: {
              flexGrow: 1,
            },
            paper: {
              padding: theme.spacing(2),
              margin: 'auto',
              maxWidth: 500,
            },
            image: {
              width: 128,
              height: 128,
            },
            img: {
              margin: 'auto',
              display: 'block',
              maxWidth: '100%',
              maxHeight: '100%',
            },
          }));


          let hash = {};

        
    }

    handleBackToListClick() {
        this.props.onClick();
    }

    handleChange(evt) { 
        var options = evt.target.options;
        var value = [];
        for (var i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {

                const id = options[i].value.toString().charAt(1);
                const newValue = options[i].value.toString().charAt(0);

                let tmpHash = this.state.hash;
                 tmpHash[id] = newValue;
                 this.setState( { hash: tmpHash });
            }
        }

    }

    hanldeUpdateQuantity(evt) {
        const hashes = this.state.hash;
        for(var id in hashes){
            // alert('updating id=' + id + ' -- newValue=' + hashes[id]);
        }
    }

    componentDidMount() {
        this.getProductsInCart();
    }

    handlePurchaseClick() {
        

        fetch(`https://mybillfunctionapp2.azurewebsites.net/api/CompletePurchase`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              }
        })
        .then(result => result.text())
        .then(function(data) {
            console.log(data);
            this.setState( 
                {
                     message: '', 
                     hasPurchased: true 
                });  
        }.bind(this))
        .catch(function(err) {
            console.log('Error completing purchase');
            console.log(err);
            this.setState( { message: 'Error completing purchase' });
        }.bind(this));;
    }

    getProductsInCart() {
        fetch('https://mybillfunctionapp2.azurewebsites.net/api/GetProductsInCart')
        .then(response => response.json())
        .then(data => {
            this.setState( { productsInCart: data });
            if (data.length === 0){
                this.setState( { message: 'Empty cart' });
            }
            else {
                let runningTotal = 0.00;
                data.map((p) => {
                    runningTotal = runningTotal + (p.ProductDetails.Price * p.QuantityDesired);
                });
           
                const tax = .06;
                const tmpTax = runningTotal * tax;
                const tmpGrandTotal = tmpTax + runningTotal;
                this.setState( 
                    { 
                        subTotal: runningTotal, 
                        grandTotal: tmpGrandTotal,
                        calculatedTax: tmpTax
                    });
            }
        })
        .catch(function(err) {
            console.log(err);
        });
    }

    handleRemoveFromCart(evt) {
        const productId = evt.currentTarget.value;
        const qty = this.state.qty;

        fetch(`https://mybillfunctionapp2.azurewebsites.net/api/RemoveItem?productId=${productId}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              }
        })
        .then(result => result.text())
        .then(data => {
            console.log(data);
            this.setState( { message: 'Product removed!' });            
        })
        .then(() => this.getProductsInCart())
        .catch(function(err) {
            console.log('Error removing product from cart');
            console.log(err);
            this.setState( { message: 'Error removing product from cart' });
        });;
    }

    handleCurrencyDisplay(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }

    render() {
        return (
            <div>
                <Button variant="contained" color="default" onClick={this.handleBackToListClick} className="addButton">
                    Back to List
                </Button>
                {
                    this.state.hasPurchased? 
                        <div>
                            <h2 className="purchaseCompleteMessage">Congrats, puchase completed!</h2>
                            <h4>Items should arrive in 1-2 business days. Thank you!</h4>
                        </div>
                        :
                        <div>
                            <h3>{this.state.message}</h3>
                            <div>
                                {this.state.productsInCart && this.state.productsInCart.map(
                                        (p) =>
                                        <div>
                                            <img className="smallCartImage"
                                                src={require(`./images/${p.ProductDetails.ImageName}`)}
                                                alt={p.ProductDetails.Name}
                                            />
                                            <h3>{p.ProductDetails.Name}</h3>
                                            {/* <FormControl>
                                                <InputLabel htmlFor="qty-simple">Qty</InputLabel>
                                                <Select 
                                                native
                                                onChange={this.handleChange}
                                                inputProps={{
                                                    name: 'qty',
                                                    id: 'qty-simple-' + p.ProductId,
                                                }}
                                                >
                                                
                                                <option value={'1' + p.ProductId} selected={p.QuantityDesired===1}>1</option>
                                                <option value={'2' + p.ProductId} selected={p.QuantityDesired===2}>2</option>
                                                <option value={'3' + p.ProductId} selected={p.QuantityDesired===3}>3</option>
                                                <option value={'4' + p.ProductId} selected={p.QuantityDesired===4}>4</option>
                                                </Select>
                                            </FormControl> */}
                                            
                                            <h3>Qty: {p.QuantityDesired} x Price: {this.handleCurrencyDisplay(p.ProductDetails.Price)} = {this.handleCurrencyDisplay(p.QuantityDesired * p.ProductDetails.Price)}</h3>
                                            <Button variant="contained" color="secondary" value={p.ProductId} onClick={this.handleRemoveFromCart} className="">
                                                Remove 
                                            </Button>
                                            <Divider className="customProductDivider"/>
                                        </div>
                                )
                            }
                            </div>
                            { this.state.productsInCart && this.state.productsInCart.length > 0?
                                <div>
                                    {/* <Button variant="contained" color="default" className="updateButton" onClick={this.hanldeUpdateQuantity}>
                                        Update
                                    </Button> */}
                                    <h4>Sub Total: {this.handleCurrencyDisplay(this.state.subTotal)}</h4>
                                    <h4>Tax (6%): {this.handleCurrencyDisplay(this.state.calculatedTax)}</h4>
                                    <h3>Grand Total: {this.handleCurrencyDisplay(this.state.grandTotal)}</h3>
                                    <Button variant="contained" className="purchaseButton" onClick={this.handlePurchaseClick} className="purchaseButton">
                                        Purchase
                                    </Button>
                                </div>
                                :
                                <div></div>
                            }
                        </div>
                    }
            </div>
        )

    }

}

export default Cart;