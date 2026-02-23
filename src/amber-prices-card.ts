// Display Amber prices
import { html, css, CSSResult, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CARD_VERSION } from './const';

console.info(
  `%c  AMBER_PRICES-CARD \n%c  Version ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

const styles = css`
  ha-card {
    overflow-x: hidden;
    > div {
      padding: 4px 4px;
      display: flex;
      flex-direction: row;
      column-gap: 2px;
      overflow-x: auto;
      > div {
        text-align: center;
        padding: 0 2px;
        border-radius: 6px;
      }
      .time {
        font-size: 80%;
      }
      .current {
        font-weight: bold;
      }
      .past {
        color: dimgray;
      }
      .blue {
        background-color: #cceeff;
      }
      .green {
        background-color: #ccffcc;
      }
      .orange {
        background-color: #ffccaa;
      }
      .red {
        background-color: #ffcccc;
      }
    }
  }
`;

interface AmberPricesCardConfig {
  amber_general_price: string;
  amber_general_forecast: string;
  amber_general_previous?: string;
  amber_feed_in_price: string;
  amber_feed_in_forecast: string;
  amber_feed_in_previous?: string;
}

@customElement('amber-prices-card')
export class AmberPricesCard extends LitElement {
  static getConfigForm() {
    return {
      schema: [
        { name: 'amber_general_price', required: true, selector: { entity: {} } },
        { name: 'amber_general_forecast', required: true, selector: { entity: {} } },
        { name: 'amber_general_previous', required: false, selector: { entity: {} } },
        { name: 'amber_feed_in_price', required: true, selector: { entity: {} } },
        { name: 'amber_feed_in_forecast', required: true, selector: { entity: {} } },
        { name: 'amber_feed_in_previous', required: false, selector: { entity: {} } },
      ],
    };
  }

  static getStubConfig() {
    return {
      amber_general_price: 'sensor.amber_general_price',
      amber_general_forecast: 'sensor.amber_general_forecast',
      amber_general_previous: 'sensor.amber_general_previous',
      amber_feed_in_price: 'sensor.amber_feed_in_price',
      amber_feed_in_forecast: 'sensor.amber_feed_in_forecast',
      amber_feed_in_previous: 'sensor.amber_feed_in_previous',
    };
  }

  static get styles(): CSSResult {
    return styles;
  }

  //////////////////////////////////////////////////////////////////////
  @property({ attribute: false }) public hass!: any;

  @property({ attribute: false }) public config!: AmberPricesCardConfig;

  public setConfig(config: AmberPricesCardConfig): void {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
  }

  public getGridOptions() {
    return {
      columns: 12,
      min_rows: 3,
    };
  }

  protected render(): TemplateResult | void {
    const general = this.hass.states[this.config.amber_general_price].attributes;
    const feedIn = this.hass.states[this.config.amber_feed_in_price].attributes;
    // @touchstart allows a swipe to scroll the prices without changing to another tab in the dashboard
    return html`
      <ha-card @touchstart="${(e) => e.stopPropagation()}" @contextmenu="${this.scrollToCurrent}">
        <div id="scroll_root">
          ${this.renderPrevious(general.start_time)} ${this.renderDiv(general, feedIn, 'current')}
          ${this.renderForecasts()}
        </div>
      </ha-card>
    `;
  }

  protected firstUpdated() {
    setTimeout(() => this.scrollToCurrent(), 100);
  }

  private scrollToCurrent(): void {
    const div = this.shadowRoot?.getElementById('scroll_root');
    if (!div) {
      return;
    }
    const current: HTMLElement = [...div.children].find((c) => c.className.includes('current')) as HTMLElement;
    // console.log({ current });
    if (current) {
      if (current.previousElementSibling) {
        div.scrollLeft = (current.previousElementSibling as HTMLElement).offsetLeft - 2;
      } else {
        div.scrollLeft = current.offsetLeft - 2;
      }
    }
  }

  private priceClass(price: number): string {
    if (price < 0.1) {
      return 'blue';
    } else if (price < 0.3) {
      return 'green';
    } else if (price < 0.5) {
      return 'orange';
    } else {
      return 'red';
    }
  }

  private renderDiv(general, feedIn, clazz?: string): TemplateResult {
    return html`<div class="${clazz} ${this.priceClass(general?.per_kwh)}">
      ${this.renderTime(general?.start_time)}<br />
      ${this.renderPrice(general?.per_kwh)}${general?.estimate ? '*' : ''}<br />
      ${this.renderPrice(feedIn?.per_kwh)}${feedIn?.estimate ? '*' : ''}
    </div>`;
  }

  private renderForecasts(): TemplateResult[] | void {
    const general = this.hass.states[this.config.amber_general_forecast].attributes.forecasts;
    const feedIn = this.hass.states[this.config.amber_feed_in_forecast].attributes.forecasts;
    if (!general) {
      return;
    }
    const h: TemplateResult[] = [];
    let duration30 = false;
    for (let i = 0; i < general.length; i++) {
      if (!duration30 && general[i].duration === 30) {
        h.push(html`<div></div>`);
        duration30 = true;
      }
      h.push(this.renderDiv(general[i], feedIn[i]));
    }
    return h;
  }

  private renderPrevious(latest): TemplateResult[] | void {
    const general = this.getPrevious(this.config.amber_general_previous, latest);
    const feedIn = this.getPrevious(this.config.amber_feed_in_previous, latest);
    if (!general) {
      return;
    }

    const h: TemplateResult[] = [];
    for (let i = 0; i < general.length; i++) {
      h.push(this.renderDiv(general[i], feedIn ? feedIn[i] : null, 'past'));
    }
    return h;
  }

  private getPrevious(entity, latest) {
    if (!entity) {
      return null;
    }

    const previous = [...this.hass.states[entity].attributes.previous];
    if (!previous || previous.length < 2) {
      return null;
    }

    if (previous[previous.length - 1].start_time === latest) {
      previous.pop();
    }
    // previous.reverse();
    return previous;
  }

  private renderPrice(price?: string | number) {
    if (typeof price !== 'number') {
      if (typeof price === 'string') {
        return isNaN(parseFloat(price)) ? '?' : this.renderPrice(Number(price));
      } else {
        return '?';
      }
    } else if (price > 1) {
      return '$' + price.toFixed(2);
    } else {
      return Math.round(price * 100) + 'c';
    }
  }

  private renderTime(dateString): TemplateResult {
    const date = new Date(dateString);
    return html`<span class="time"
      >${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}</span
    >`;
  }
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'amber-prices-card',
  name: 'Amber Prices Card',
  preview: false,
  description: 'Display Amber prices and forecasts',
  //   documentationURL: 'https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card', // Adds a help link in the frontend card editor
});
