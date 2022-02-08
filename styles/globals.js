import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    :root {
        --background: #FEFEFE;
        --text-primary: #111;
        --text-secondary: #999;
        --text-tertiary: #666;
        --text-primary-inverse: white;
        --text-keys: black;

        --modal-background: #ffffff;
        --color-good: var(--nextui-colors-green400);
        --color-bad: var(--nextui-colors-gray600);
        --color-off: var(--nextui-colors-yellow400);
        --color-unknown: #ccc;

        --color-share-button: #2c3e50;
        --color-button: #2980b9;
        --color-button-text: white;
        --color-button-enabled: #2c3e50;

        --color-primary: #0984e3;

        --focus-color: cyan;
        --keyboard-border-color: #666;

        @media (prefers-color-scheme: dark) {
            --background: #111;
            --text-primary: #FEFEFE;
            --text-secondary: #ccc;
            --text-tertiary: #999;
            --text-keys: black;
            --text-primary-inverse: #000;
            --modal-background: #333;

            --focus-color: rgba(128,128,255,0.8);
            --keyboard-border-color: #999;

        }


        @media (prefers-contrast: more) {
            --color-good: var(--nextui-colors-yellow500);
            --color-off: var(--nextui-colors-blue200);
            
        }
    }

    

    html,
    body {
    padding: 0;
    margin: 0;


        background-color: var(--background);
    }

    body.colorblind {
        --color-good: var(--nextui-colors-yellow500);
            --color-off: var(--nextui-colors-blue200);     
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
