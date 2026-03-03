# Amber Prices Card for Home Assistant<!-- omit in toc -->

This card shows the previous, current and predicted prices for [Amber Electric](https://www.amber.com.au/).

![Amber Prices Card](card.png)

Current and predicted prices work with the [Amber Electric](https://www.home-assistant.io/integrations/amberelectric) integration in Home Assistant. In addition, previous prices are available with the [Amber Prices](https://github.com/homotics/amber_prices) integration.

# Installation

### Install via HACS

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=homotics&repository=amber-prices-card&category=dashboard)

### Manual

1. Download `amber-prices-card.js` file from the [latest release][release-url].
2. Put `amber-prices-card.js` file into your Home Assistant `config/www` folder.
3. Add reference to `amber-prices-card.js` in Dashboard:
   - Go to _Settings_ → _Dashboards_
   - From the _Menu icon_ (top right) select _Resources_ (if you do not see the Resources menu, you will need to enable _Advanced Mode_ in your _User Profile_)
   - Click _Add Resource_
   - Set _Url_ as `/local/amber-prices-card.js`
   - Set _Resource type_ as _JavaScript Module_
   - Click _Create_

# Usage

Select Amber Prices card when editing your dashboard.

If you are using the Home Assistant [Amber Electric](https://www.home-assistant.io/integrations/amberelectric) integration,
then leave the _Amber general previous_ and _Amber feed in previous_ fields empty.
If you are using the [Amber Prices](https://github.com/homotics/amber_prices) integration then all the entities should be available.

Scroll left or right with a mouse, or drag left or right on a phone or tablet to see the other prices. Right click to return to the current price.
