import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Children, useCallback } from 'react';
import { composeRenderProps, useLocale } from 'react-aria-components';
import { Button } from './Button.js';
import { GridList, GridListItem } from './GridList.js';
import { Check, Cross } from './glyphs.js';
import { ProgressBar } from './ProgressBar.js';
import { tv } from './tv.js';
/**
 * The files chosen or dropped, as rows under a DropZone: a site keeps the files, and their uploads, in its own state,
 * and adds to it from the zone’s onDrop and its FileTrigger’s onSelect. Each row is a FileListItem. With no files it
 * renders nothing, so it can sit under the zone from the start. Give it an aria-label, such as “Uploads”
 */
export function FileList({ items, children, ...props }) {
    const isEmpty = items ? [...items].length === 0 : typeof children !== 'function' && Children.count(children) === 0;
    if (isEmpty)
        return null;
    return (_jsx(GridList, { ...props, items: items, className: composeRenderProps(props.className, (className) => `gap-1 ${className ?? ''}`), children: children }));
}
export const fileListItem = tv({
    slots: {
        // Six pixels round the thumbnail, so its 6px corners sit concentric in the row's 12px
        base: 'rounded-xl p-1.5 pe-2',
        thumbnail: 'relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-bleed/8 text-muted after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring after:inset-ring-bleed/8',
        image: 'size-full object-cover',
        body: 'flex min-w-0 flex-1 flex-col',
        name: 'flex min-w-0 text-control text-ink',
        meta: 'flex min-w-0 items-center gap-2 text-label text-muted tabular-nums',
        actions: 'flex shrink-0 items-center gap-0.5',
        done: 'flex size-7 items-center justify-center text-ink',
        // Why it failed wraps rather than truncates, as it's no use cut short
        error: 'min-w-0 text-pretty',
    },
    variants: {
        status: {
            uploading: {},
            done: {},
            failed: { meta: 'text-danger' },
        },
    },
});
// The extension and a few letters before it, which stay put while the start of a long name gives way to an ellipsis
const tailLength = (name) => {
    const dot = name.lastIndexOf('.');
    return Math.min(name.length, (dot > 0 ? name.length - dot : 0) + 6);
};
function MiddleTruncated({ name }) {
    const tail = name.slice(name.length - tailLength(name));
    const head = name.slice(0, name.length - tail.length);
    // Split in two, a screen reader could read the halves as two words, so it reads the whole name instead
    return (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", className: "min-w-0 truncate", children: head }), _jsx("span", { "aria-hidden": "true", className: "shrink-0 whitespace-pre", children: tail }), _jsx("span", { className: "sr-only", children: name })] }));
}
// Steps of a thousand, as Finder and Explorer count them, in the locale's own units, as in 2.4 MB or 2,4 Mo
const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'];
function formatSize(bytes, locale) {
    const step = Math.min(units.length - 1, Math.max(0, Math.floor(Math.log10(Math.max(bytes, 1)) / 3)));
    const value = bytes / 1000 ** step;
    return new Intl.NumberFormat(locale, { style: 'unit', unit: units[step], unitDisplay: 'short', maximumFractionDigits: value < 10 && step > 0 ? 1 : 0 }).format(value);
}
// An image file's own picture, as an object URL made as the image mounts and let go as it unmounts or the file changes
function useObjectUrl(file) {
    return useCallback((image) => {
        if (!image || !file)
            return;
        const url = URL.createObjectURL(file);
        image.src = url;
        return () => URL.revokeObjectURL(url);
    }, [file]);
}
const Document = () => (_jsx("svg", { "aria-hidden": "true", viewBox: "0 0 16 16", className: "size-4 fill-none stroke-current stroke-[1.5]", children: _jsx("path", { d: "M4 2.75h4.5L12 6.25v7H4z M8.5 2.75v3.5H12", strokeLinejoin: "round" }) }));
/** A file in a FileList: its thumbnail or an icon, its name and size, how its upload is going, and buttons to retry or remove it */
export function FileListItem({ file, name = file?.name ?? '', size = file?.size, thumbnail, status, progress, errorMessage, onRemove, onRetry, ...props }) {
    const { locale } = useLocale();
    const attach = useObjectUrl(thumbnail ? undefined : file);
    const isImage = thumbnail != null || (file?.type.startsWith('image/') ?? false);
    const slots = fileListItem({ status });
    const sizeText = size != null ? formatSize(size, locale) : undefined;
    return (_jsxs(GridListItem, { ...props, textValue: name, className: composeRenderProps(props.className, (className) => slots.base({ className })), children: [_jsx("span", { className: slots.thumbnail(), children: isImage ? _jsx("img", { ref: thumbnail ? undefined : attach, src: thumbnail, alt: "", className: slots.image() }) : _jsx(Document, {}) }), _jsxs("span", { className: slots.body(), children: [_jsx("span", { className: slots.name(), title: name, children: _jsx(MiddleTruncated, { name: name }) }), _jsx("span", { className: slots.meta(), children: status === 'uploading' ? (_jsx(ProgressBar, { "aria-label": `Uploading ${name}`, value: progress, isIndeterminate: progress == null, className: "w-full max-w-64" })) : status === 'failed' ? (_jsx("span", { className: slots.error(), children: errorMessage ?? 'Couldn’t upload' })) : (sizeText) })] }), (status === 'done' || (status === 'failed' && onRetry) || onRemove) && (_jsxs("span", { className: slots.actions(), children: [status === 'failed' && onRetry && (_jsx(Button, { variant: "ghost", size: "small", onPress: onRetry, "aria-label": `Retry ${name}`, children: "Retry" })), status === 'done' && (_jsxs("span", { className: slots.done(), children: [_jsx(Check, {}), _jsx("span", { className: "sr-only", children: "Uploaded" })] })), onRemove && (_jsx(Button, { variant: "ghost", size: "small", onPress: onRemove, "aria-label": `Remove ${name}`, children: _jsx(Cross, {}) }))] }))] }));
}
