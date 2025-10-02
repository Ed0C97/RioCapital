import type { HTMLInputElementMasked, OptionalSimpleMaskMoneyConfiguration } from 'src/types';
/**
 * It applies a mask to an input element, formatting its value as a currency.
 * It takes an input element and an optional configuration object as parameters.
 * The function listens for keyboard events on the input element and updates its value accordingly.
 * It also handles caret positioning and allows for undoing changes. The function returns a method to remove the mask from the input element.
 *
 * @remarks
 * This method is part of the {@link https://github.com/codermarcos/simple-mask-money/ | SimpleMaskMoney} to see the full documentation check {@link https://github.com/codermarcos/simple-mask-money/tree/main/examples/4.x.x#simplemaskmoneysetmask | SimpleMaskMoney.setMask}
 *
 * @param {HTMLInputElement | string | null} input - The first can be a QueryCSSSelectorString or an Input
 * @param {Partial<SimpleMaskMoneyConfiguration>} configuration - The second is an object with the configuration to check options visit {@link https://github.com/codermarcos/simple-mask-money/tree/main/examples/4.x.x#simplemaskMoneyconfiguration | SimpleMaskMoneyConfiguration}
 * @returns {() => void} A function to remove the input mask
 *
 * @example
 * Here's an example using from cdn with CSSSelector:
 * ```html
 * <script src=""></script>
 *
 * <input id="my-input" />
 *
 * <script>
 *     const remove = SimpleMaskMoney.setMask('#my-input');
 *     remove(); // To remove the mask and listeners
 * </script>
 * ```
 *
 * @example
 * Here's an example using from npm to React with CSSSelector:
 * ```jsx
 * import { setMask } from 'simple-mask-money';
 *
 * function InputMoney() {
 *    useEffect(() => setMask('#my-input'), []);
 *
 *    return <input id="my-input" />;
 * }
 * ```
 *
 * @throws {@link ADD_LINK_AQUI}
 * This exception is thrown if the element is not an input.
 */
declare function setMask(input: HTMLInputElementMasked | HTMLInputElement | string | null, configuration?: OptionalSimpleMaskMoneyConfiguration): () => void;
export default setMask;
/**
 * Check the {@link https://github.com/codermarcos/simple-mask-money/tree/main/examples/4.x.x#SimpleMaskMoney.setMask | SimpleMaskMoney.setMask} method to get more information about this type
 *
 * @remarks
 * This type is part of the {@link https://github.com/codermarcos/simple-mask-money/ | SimpleMaskMoney} to see the full documentation check {@link https://github.com/codermarcos/simple-mask-money/tree/main/examples/4.x.x#SimpleMaskMoney.setMask | SimpleMaskMoney.setMask}
 */
export type SetMaskFunction = typeof setMask;
