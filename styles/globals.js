import { globalCss } from "@nextui-org/react";

const GlobalStyle = globalCss({
    ":root": {
        "--text-primary-inverse": "white",
        "--text-keys": "black",
        "--color-good": "var(--nextui-colors-green600)",
        "--color-bad": "var(--nextui-colors-gray800)",
        "--color-off": "var(--nextui-colors-yellow500)",
        "--color-unknown": "var(--nextui-colors-gray400)",
        "--focus-color": "cyan",
        "--keyboard-border-color": "#666",
        "--color-level": "var(--nextui-colors-primary)",
        "--color-level-active": "var(--nextui-colors-secondaryShadow)",
        "--color-icon-left": "var(--nextui-colors-blue200)",
        "--color-icon-right": "var(--nextui-colors-pink200)",
        "@media (prefers-color-scheme: dark)": {
            "--color-unknown": "var(--nextui-colors-gray800)",
            "--color-bad": "var(--nextui-colors-gray400)",
            "--text-keys": "black",
            "--text-primary-inverse": "#000",
            "--focus-color": "rgba(128,128,255,0.8)",
            "--keyboard-border-color": "#999",
        },
    },
    "html.dark-theme": {
        "--color-unknown": "var(--nextui-colors-gray800)",
        "--color-bad": "var(--nextui-colors-gray400)",
        "--text-keys": "black",
        "--text-primary-inverse": "#000",
        "--focus-color": "rgba(128,128,255,0.8)",
        "--keyboard-border-color": "#999",
    },
    "body.colorblind": {
        "--color-good": "var(--nextui-colors-yellow600)",
        "--color-off": "var(--nextui-colors-blue300)",
        "--color-level": "var(--nextui-colors-primary)",
        "--color-level-active": "var(--nextui-colors-secondaryShadow)",
        "--color-icon-left": "var(--nextui-colors-primaryDark)",
        "--color-icon-right": "var(--nextui-colors-primaryDark)",
    },
});

export default GlobalStyle;
