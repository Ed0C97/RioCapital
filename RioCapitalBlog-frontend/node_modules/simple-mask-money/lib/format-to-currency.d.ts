import type { OptionalSimpleMaskMoneyConfiguration } from 'src/types';
/**
 * It formats the input value as a currency string based on the provided configuration and returns the formatted output
 * It takes a number or string value and an optional configuration object as input.
 *
 * @remarks
 * This method is part of the {@link https://github.com/codermarcos/simple-mask-money/ | SimpleMaskMoney} to see the full documentation check {@link https://github.com/codermarcos/simple-mask-money/tree/main/examples/4.x.x#formattocurrency | SimpleMaskMoney.formatToCurrency}
 *
 * @param {string | number} value - The first can be a number or string
 * @param {Partial<SimpleMaskMoneyConfiguration>} configuration - The second is an object with the configuration to check options visit {@link https://github.com/codermarcos/simple-mask-money/tree/main/examples/4.x.x#simplemaskMoneyconfiguration | SimpleMaskMoneyConfiguration}
 * @returns {string} A formated string based on the input value and configuration options e.g when receive `0.66` return `$0,66`
 *
 * @example
 * Here's an example using from cdn with CSSSelector:
 * ```html
 * <script src=""></script>
 *
 * <script>
 *     const value = SimpleMaskMoney.formatToCurrency(666.99, { prefix: '$' });
 *     console.log(value); // "$666,99"
 * </script>
 * ```
 *
 * @example
 * Here's an example using from npm with ESmodules:
 * ```javascript
 * import { formatToCurrency } from 'simple-mask-money';
 *
 * const value = formatToCurrency(666.99, { prefix: '$' });
 * console.log(value); // "$666,99"
 * ```
 */
declare function formatToCurrency(value: number | string, configuration?: OptionalSimpleMaskMoneyConfiguration): string;
export default formatToCurrency;
/**
 * Check the {@link https://github.com/codermarcos/simple-mask-money/tree/main/examples/4.x.x#formattocurrency | SimpleMaskMoney.formatToCurrency} method to get more information about this type
 *
 * @remarks
 * This type is part of the {@link https://github.com/codermarcos/simple-mask-money/ | SimpleMaskMoney} to see the full documentation check {@link https://github.com/codermarcos/simple-mask-money/tree/main/examples/4.x.x#formattocurrency | SimpleMaskMoney.formatToCurrency}
 */
export type FormatToCurrencyFunction = typeof formatToCurrency;
