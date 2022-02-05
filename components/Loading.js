import { Main, InnerWrapper, Board, Row, Letter } from "./styled";
import Footer from "./Footer";

const Loading = () => {
  return (
    <Main $initializing={false}>
      <InnerWrapper></InnerWrapper>
      <Footer />
    </Main>
  );
};

export default Loading;
