import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    :root {
        --background: #ffffff;
        --text-primary: black;
        --text-secondary: #999;
        --text-tertiary: #666;
        --text-primary-inverse: white;
        --text-keys: black;

        --modal-background: #ffffff;
        --color-good: #0f0;
        --color-bad: #666;
        --color-off: #ff0;
        --color-unknown: #ccc;

        --color-share-button: #e67e22;

        --focus-color: cyan;
        --keyboard-border-color: #666;

        @media (prefers-color-scheme: dark) {
            --background: #000000;
            --text-primary: #fff;
            --text-secondary: #ccc;
            --text-tertiary: #999;
            --text-keys: black;
            --text-primary-inverse: #000;
            --modal-background: #333;

            --focus-color: rgba(128,128,255,0.8);
            --keyboard-border-color: #999;

        }


        @media (prefers-contrast: more) {
            --color-good: #f5793a;
            --color-off: #85c0f9;
        }
    }


    html,
    body {
    padding: 0;
    margin: 0;
    font-family:  -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
        Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        background-color: var(--background);
    }

    body.colorblind {
        --color-good: #f5793a;
        --color-off: #85c0f9;       
    }

    a {
    color: inherit;
    text-decoration: none;
    }

    * {
    box-sizing: border-box;
    }


   
`;

export default GlobalStyle;