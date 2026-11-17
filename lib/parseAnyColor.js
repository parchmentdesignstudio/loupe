import { parseColor } from 'react-aria-components';
/**
 * Any CSS colour as a React Aria Color, which only parses hex, rgb(), hsl() and hsb() itself. Takes hex with or without
 * its #, a name such as rebeccapurple, transparent, rgb(), hsl(), hwb(), lab(), lch(), oklab(), oklch() and color() in
 * srgb, srgb-linear, display-p3 or xyz, in modern or comma syntax. A colour outside sRGB is brought in as CSS does,
 * losing chroma but keeping its lightness and hue, so a vivid P3 or oklch colour stays as close as sRGB allows, while
 * oklch keeps it exactly.
 * Null when it isn't a colour
 */
export function parseAnyColor(text) {
    const source = text.trim().toLowerCase();
    if (source === '')
        return null;
    if (source === 'transparent')
        return result([0, 0, 0], 0, true);
    const named = names().get(source);
    if (named)
        return fromHex(named);
    const hex = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(source);
    if (hex)
        return fromHex(hex[1]);
    const call = /^([a-z-]+)\(\s*(.*?)\s*\)$/.exec(source);
    if (!call)
        return null;
    return fromFunction(call[1], call[2]);
}
function fromHex(digits) {
    const long = digits.length <= 4 ? [...digits].map((digit) => digit + digit).join('') : digits;
    const bytes = long.match(/../g)?.map((pair) => Number.parseInt(pair, 16) / 255);
    if (!bytes)
        return null;
    return result(linear([bytes[0], bytes[1], bytes[2]]), bytes[3] ?? 1, bytes.length === 4, false);
}
function fromFunction(name, body) {
    // Modern syntax puts alpha after a slash. Comma syntax gives it as a fourth argument
    const [main, slashed] = body.split('/').map((part) => part.trim());
    if (body.split('/').length > 2)
        return null;
    const isCommas = main.includes(',');
    const args = (isCommas ? main.split(',') : main.split(/\s+/)).map((arg) => arg.trim()).filter(Boolean);
    if (name === 'color')
        return fromColorFunction(args, slashed);
    if (args.length === 4 && isCommas && slashed === undefined)
        return fromChannels(name, args.slice(0, 3), args[3]);
    if (args.length !== 3)
        return null;
    return fromChannels(name, args, slashed);
}
function fromChannels(name, args, alphaText) {
    const alpha = alphaText === undefined ? 1 : number(alphaText, 1);
    if (alpha === null)
        return null;
    const hasAlpha = alphaText !== undefined;
    // CSS clamps these as it parses them, so rgb(300 0 0) is red and oklch(0.5 -0.1 30) grey. color() isn't clamped, as
    // it reaches outside sRGB
    switch (name) {
        case 'rgb':
        case 'rgba': {
            const channels = args.map((arg) => within(number(arg, 255), 0, 255));
            if (channels.some((channel) => channel === null))
                return null;
            return result(linear(channels.map((channel) => channel / 255)), alpha, hasAlpha, false);
        }
        case 'hsl':
        case 'hsla': {
            const [hue, saturation, lightness] = [angle(args[0]), within(number(args[1], 100), 0, 100), within(number(args[2], 100), 0, 100)];
            if (hue === null || saturation === null || lightness === null)
                return null;
            return result(linear(hslToRgb(hue, saturation / 100, lightness / 100)), alpha, hasAlpha, false);
        }
        case 'hwb': {
            const [hue, white, black] = [angle(args[0]), within(number(args[1], 100), 0, 100), within(number(args[2], 100), 0, 100)];
            if (hue === null || white === null || black === null)
                return null;
            return result(linear(hwbToRgb(hue, white / 100, black / 100)), alpha, hasAlpha, false);
        }
        case 'lab': {
            const [l, a, b] = [within(number(args[0], 100), 0, 100), number(args[1], 125), number(args[2], 125)];
            if (l === null || a === null || b === null)
                return null;
            return result(labToLinear(l, a, b), alpha, hasAlpha);
        }
        case 'lch': {
            const [l, c, h] = [within(number(args[0], 100), 0, 100), within(number(args[1], 150), 0), angle(args[2])];
            if (l === null || c === null || h === null)
                return null;
            return result(labToLinear(l, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)), alpha, hasAlpha);
        }
        case 'oklab': {
            const [l, a, b] = [within(number(args[0], 1), 0, 1), number(args[1], 0.4), number(args[2], 0.4)];
            if (l === null || a === null || b === null)
                return null;
            const c = Math.hypot(a, b);
            return result(oklabToLinear([l, a, b]), alpha, hasAlpha, true, { l, c, h: c === 0 ? 0 : (((Math.atan2(b, a) * 180) / Math.PI) % 360 + 360) % 360 });
        }
        case 'oklch': {
            const [l, c, h] = [within(number(args[0], 1), 0, 1), within(number(args[1], 0.4), 0), angle(args[2])];
            if (l === null || c === null || h === null)
                return null;
            return fromOklch({ l, c, h }, alpha, hasAlpha);
        }
        default:
            return null;
    }
}
function fromColorFunction(args, alphaText) {
    if (args.length !== 4)
        return null;
    const [space, ...rest] = args;
    const channels = rest.map((arg) => number(arg, 1));
    const alpha = alphaText === undefined ? 1 : number(alphaText, 1);
    if (channels.some((channel) => channel === null) || alpha === null)
        return null;
    const values = channels;
    const hasAlpha = alphaText !== undefined;
    switch (space) {
        case 'srgb':
            return result(linear(values), alpha, hasAlpha);
        case 'srgb-linear':
            return result(values, alpha, hasAlpha);
        case 'display-p3':
            return result(multiply(XYZ_TO_SRGB, multiply(P3_TO_XYZ, linear(values))), alpha, hasAlpha);
        case 'xyz':
        case 'xyz-d65':
            return result(multiply(XYZ_TO_SRGB, values), alpha, hasAlpha);
        case 'xyz-d50':
            return result(multiply(XYZ_TO_SRGB, multiply(D50_TO_D65, values)), alpha, hasAlpha);
        default:
            return null;
    }
}
// A number, a percentage of its reference, or none, which CSS reads as 0
function number(text, reference) {
    if (text === 'none')
        return 0;
    const match = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(%?)$/.exec(text);
    if (!match)
        return null;
    const value = Number.parseFloat(match[1]);
    return match[2] ? (value / 100) * reference : value;
}
const within = (value, min, max = Number.POSITIVE_INFINITY) => (value === null ? null : Math.min(max, Math.max(min, value)));
// A hue in degrees, from a bare number or deg, rad, grad or turn
function angle(text) {
    if (text === 'none')
        return 0;
    const match = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(deg|rad|grad|turn)?$/.exec(text);
    if (!match)
        return null;
    const value = Number.parseFloat(match[1]);
    const degrees = { deg: value, rad: (value * 180) / Math.PI, grad: value * 0.9, turn: value * 360 }[match[2] ?? 'deg'] ?? value;
    return ((degrees % 360) + 360) % 360;
}
/** An oklch colour, such as one a ParsedColor kept, as a ParsedColor again, without the rounding formatOklch's text has */
export function fromOklch(oklch, alpha = 1, hasAlpha = alpha < 1) {
    const hue = (oklch.h * Math.PI) / 180;
    return result(oklabToLinear([oklch.l, oklch.c * Math.cos(hue), oklch.c * Math.sin(hue)]), alpha, hasAlpha, true, oklch);
}
// Linear sRGB in, which may be out of gamut for anything wider. The oklch is taken before it's brought in, so it stays
// exact. A number too big to work with, such as 1e999, ends in NaN, which parseColor throws on, so it isn't a colour
function result(rgb, alpha, hasAlpha, isWide = true, exact) {
    const oklch = exact ?? toOklch(rgb);
    const fitted = isWide ? fit(rgb) : rgb;
    if (![...rgb, ...fitted, oklch.l, oklch.c, oklch.h].every(Number.isFinite))
        return null;
    const [r, g, b] = fitted.map((channel) => Math.round(clamp(encode(channel)) * 255));
    const opacity = Math.round(clamp(alpha) * 1000) / 1000;
    const color = parseColor(`rgba(${r}, ${g}, ${b}, ${opacity})`);
    return { color, oklch, alpha: opacity, hasAlpha, isInSrgb: inGamut(rgb) };
}
function toOklch(rgb) {
    const [l, a, b] = linearToOklab(rgb);
    const c = Math.hypot(a, b);
    // A grey's hue is noise from the conversion, so it's 0, as CSS writes it
    if (c < 2e-4)
        return { l, c: 0, h: 0 };
    return { l, c, h: (((Math.atan2(b, a) * 180) / Math.PI) % 360 + 360) % 360 };
}
// A number to so many places, without trailing zeros
const trim = (value, places) => String(Number(value.toFixed(places)));
/** An oklch colour as CSS, such as oklch(65.3% 0.1934 40.25 / 0.6), precise enough to come back as the same colour.
 * Alpha is left out when it's 1 */
export function formatOklch({ l, c, h }, alpha = 1) {
    const chroma = trim(c, 4);
    const hue = chroma === '0' ? '0' : trim(h, 2);
    const opacity = alpha < 1 ? ` / ${trim(alpha, 3)}` : '';
    return `oklch(${trim(l * 100, 2)}% ${chroma} ${hue}${opacity})`;
}
// CSS Color 4's gamut mapping, so a colour comes in as a browser brings it in. A colour that clipping moves by less than a
// just noticeable difference is clipped, such as one formatOklch rounded a hair outside sRGB. Any other loses chroma,
// keeping its lightness and hue, until clipping it moves it by just under that
function fit(rgb) {
    if (inGamut(rgb))
        return rgb;
    const origin = linearToOklab(rgb);
    const [l, a, b] = origin;
    if (l >= 1)
        return [1, 1, 1];
    if (l <= 0)
        return [0, 0, 0];
    const hue = Math.atan2(b, a);
    let clipped = clip(rgb);
    if (difference(clipped, origin) < JND)
        return clipped;
    let min = 0;
    let max = Math.hypot(a, b);
    let isMinInGamut = true;
    while (max - min > 1e-4) {
        const chroma = (min + max) / 2;
        const current = [l, chroma * Math.cos(hue), chroma * Math.sin(hue)];
        const linearCurrent = oklabToLinear(current);
        if (isMinInGamut && inGamut(linearCurrent)) {
            min = chroma;
            continue;
        }
        clipped = clip(linearCurrent);
        const moved = difference(clipped, current);
        if (moved >= JND) {
            max = chroma;
            continue;
        }
        if (JND - moved < 1e-4)
            return clipped;
        isMinInGamut = false;
        min = chroma;
    }
    return clipped;
}
const JND = 0.02;
const inGamut = (rgb) => rgb.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);
const clamp = (value) => Math.min(1, Math.max(0, value));
const clip = (rgb) => rgb.map(clamp);
// deltaEOK, the distance between two colours in Oklab
const difference = (rgb, oklab) => Math.hypot(...linearToOklab(rgb).map((value, index) => value - oklab[index]));
function linear(rgb) {
    return rgb.map((channel) => {
        const size = Math.abs(channel);
        return Math.sign(channel) * (size <= 0.04045 ? size / 12.92 : ((size + 0.055) / 1.055) ** 2.4);
    });
}
function encode(channel) {
    const size = Math.abs(channel);
    return Math.sign(channel) * (size <= 0.0031308 ? size * 12.92 : 1.055 * size ** (1 / 2.4) - 0.055);
}
function multiply(matrix, vector) {
    return matrix.map((row) => row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2]);
}
function oklabToLinear([l, a, b]) {
    const lms = [l + 0.3963377774 * a + 0.2158037573 * b, l - 0.1055613458 * a - 0.0638541728 * b, l - 0.0894841775 * a - 1.291485548 * b].map((value) => value ** 3);
    return multiply([
        [4.0767416621, -3.3077115913, 0.2309699292],
        [-1.2684380046, 2.6097574011, -0.3413193965],
        [-0.0041960863, -0.7034186147, 1.707614701],
    ], lms);
}
function linearToOklab(rgb) {
    const lms = multiply([
        [0.4122214708, 0.5363325363, 0.0514459929],
        [0.2119034982, 0.6806995451, 0.1073969566],
        [0.0883024619, 0.2817188376, 0.6299787005],
    ], rgb).map(Math.cbrt);
    return multiply([
        [0.2104542553, 0.793617785, -0.0040720468],
        [1.9779984951, -2.428592205, 0.4505937099],
        [0.0259040371, 0.7827717662, -0.808675766],
    ], lms);
}
// CIE Lab is relative to D50, so it's adapted to sRGB's D65 white on the way
function labToLinear(l, a, b) {
    const kappa = 24389 / 27;
    const epsilon = 216 / 24389;
    const fy = (l + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;
    const xyz = [fx ** 3 > epsilon ? fx ** 3 : (116 * fx - 16) / kappa, l > kappa * epsilon ? fy ** 3 : l / kappa, fz ** 3 > epsilon ? fz ** 3 : (116 * fz - 16) / kappa];
    const d50 = [xyz[0] * 0.9642956764295677, xyz[1], xyz[2] * 0.8251046025104602];
    return multiply(XYZ_TO_SRGB, multiply(D50_TO_D65, d50));
}
function hslToRgb(hue, saturation, lightness) {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const channel = (n) => {
        const k = (n + hue / 30) % 12;
        return lightness - (chroma / 2) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [channel(0), channel(8), channel(4)];
}
function hwbToRgb(hue, white, black) {
    if (white + black >= 1) {
        const grey = white / (white + black);
        return [grey, grey, grey];
    }
    return hslToRgb(hue, 1, 0.5).map((channel) => channel * (1 - white - black) + white);
}
const XYZ_TO_SRGB = [
    [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
    [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
    [0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
];
const P3_TO_XYZ = [
    [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
    [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
    [0, 0.04511338185890264, 1.043944368900976],
];
const D50_TO_D65 = [
    [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
    [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
    [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
];
// CSS's named colours, unpacked the first time a name is looked up. A Map, as an object would find constructor or
// __proto__ on its prototype
let named;
function names() {
    named ??= new Map(NAMES.split(' ').map((entry) => entry.split(':')));
    return named;
}
const NAMES = 'aliceblue:f0f8ff antiquewhite:faebd7 aqua:00ffff aquamarine:7fffd4 azure:f0ffff beige:f5f5dc bisque:ffe4c4 black:000000 blanchedalmond:ffebcd blue:0000ff blueviolet:8a2be2 brown:a52a2a burlywood:deb887 cadetblue:5f9ea0 chartreuse:7fff00 chocolate:d2691e coral:ff7f50 cornflowerblue:6495ed cornsilk:fff8dc crimson:dc143c cyan:00ffff darkblue:00008b darkcyan:008b8b darkgoldenrod:b8860b darkgray:a9a9a9 darkgreen:006400 darkgrey:a9a9a9 darkkhaki:bdb76b darkmagenta:8b008b darkolivegreen:556b2f darkorange:ff8c00 darkorchid:9932cc darkred:8b0000 darksalmon:e9967a darkseagreen:8fbc8f darkslateblue:483d8b darkslategray:2f4f4f darkslategrey:2f4f4f darkturquoise:00ced1 darkviolet:9400d3 deeppink:ff1493 deepskyblue:00bfff dimgray:696969 dimgrey:696969 dodgerblue:1e90ff firebrick:b22222 floralwhite:fffaf0 forestgreen:228b22 fuchsia:ff00ff gainsboro:dcdcdc ghostwhite:f8f8ff gold:ffd700 goldenrod:daa520 gray:808080 green:008000 greenyellow:adff2f grey:808080 honeydew:f0fff0 hotpink:ff69b4 indianred:cd5c5c indigo:4b0082 ivory:fffff0 khaki:f0e68c lavender:e6e6fa lavenderblush:fff0f5 lawngreen:7cfc00 lemonchiffon:fffacd lightblue:add8e6 lightcoral:f08080 lightcyan:e0ffff lightgoldenrodyellow:fafad2 lightgray:d3d3d3 lightgreen:90ee90 lightgrey:d3d3d3 lightpink:ffb6c1 lightsalmon:ffa07a lightseagreen:20b2aa lightskyblue:87cefa lightslategray:778899 lightslategrey:778899 lightsteelblue:b0c4de lightyellow:ffffe0 lime:00ff00 limegreen:32cd32 linen:faf0e6 magenta:ff00ff maroon:800000 mediumaquamarine:66cdaa mediumblue:0000cd mediumorchid:ba55d3 mediumpurple:9370db mediumseagreen:3cb371 mediumslateblue:7b68ee mediumspringgreen:00fa9a mediumturquoise:48d1cc mediumvioletred:c71585 midnightblue:191970 mintcream:f5fffa mistyrose:ffe4e1 moccasin:ffe4b5 navajowhite:ffdead navy:000080 oldlace:fdf5e6 olive:808000 olivedrab:6b8e23 orange:ffa500 orangered:ff4500 orchid:da70d6 palegoldenrod:eee8aa palegreen:98fb98 paleturquoise:afeeee palevioletred:db7093 papayawhip:ffefd5 peachpuff:ffdab9 peru:cd853f pink:ffc0cb plum:dda0dd powderblue:b0e0e6 purple:800080 rebeccapurple:663399 red:ff0000 rosybrown:bc8f8f royalblue:4169e1 saddlebrown:8b4513 salmon:fa8072 sandybrown:f4a460 seagreen:2e8b57 seashell:fff5ee sienna:a0522d silver:c0c0c0 skyblue:87ceeb slateblue:6a5acd slategray:708090 slategrey:708090 snow:fffafa springgreen:00ff7f steelblue:4682b4 tan:d2b48c teal:008080 thistle:d8bfd8 tomato:ff6347 turquoise:40e0d0 violet:ee82ee wheat:f5deb3 white:ffffff whitesmoke:f5f5f5 yellow:ffff00 yellowgreen:9acd32';
