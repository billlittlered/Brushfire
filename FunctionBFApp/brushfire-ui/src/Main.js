import React, { Component } from 'react';
import Products from './products';
import './Main.css';
import Cart from './Cart';


import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';

const StyledBadge1 = withStyles(theme => ({
    badge: {
      right: -3,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }))(Badge);

class Main extends Component {

    constructor(props) {
        super(props);

        this.state = 
        { 
            numDistinctProductsAdded: 0,
            showCartPage: false
        };
        
        this.handleCartClick = this.handleCartClick.bind(this);
        this.displayNumberOfProductsInCart = this.displayNumberOfProductsInCart.bind(this);
    }

    componentDidMount() {
        this.displayNumberOfProductsInCart();
    }

    displayNumberOfProductsInCart() {
        let currentComponent = this;

        fetch('https://mybillfunctionapp2.azurewebsites.net/api/GetNumberofProductsInCart', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              }
        })
        .then(response => response.json())
        .then(function(data) {
                currentComponent.setState( { numDistinctProductsAdded: data }) ;
            }.bind(this))
        .catch(function(err) {
            console.log(err);
        });
    }

    handleCartClick() {
        this.setState( { showCartPage: true } );
    }

    handleCartReloadCounter(key) {
        this.displayNumberOfProductsInCart();
        this.setState( { showCartPage: false });
    }

    render() {
        return (
            <div>
                {
                !this.state.showCartPage ?
                    <div>
                        <div className="Main-header">
                        <IconButton aria-label="cart" onClick={this.handleCartClick} >
                            <StyledBadge1 badgeContent={this.state.numDistinctProductsAdded} color="primary" className="BadgeOverride">
                                <ShoppingCartIcon />
                            </StyledBadge1>
                        </IconButton>
                        </div>
                        <Products  onClick={this.handleCartReloadCounter.bind(this)} />
                    </div>
                :
                <div>
                    <Cart onClick={this.handleCartReloadCounter.bind(this)} />
                </div>
                }
            </div>
        )
    }
}

export default Main;