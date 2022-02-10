import { Link } from "@nextui-org/react";
import { useRemark } from "react-remark";
import { useEffect } from "react";

const Markdown = ({ text }) => {
  const [reactContent, setMarkdownSource] = useRemark({
    rehypeReactOptions: {
      components: {
        a: (props) => (
          <Link {...props} target="_blank" rel="noopener noreferer">
            {props.children}
          </Link>
        ),
      },
    },
  });

  useEffect(() => {
    setMarkdownSource(text);
  }, [text]);

  return reactContent;
};

export default Markdown;
