import { Container, Row, Col, Button, Text, Tooltip } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { InfoSquare, Chart } from "react-iconly";

import { setModal } from "../redux/features/modal";

const Header = () => {
  const dispatch = useDispatch();
  const gameType = useSelector((state) => state.settings.gameType);
  return (
    <Container
      justify="space-between"
      alignItems="center"
      alignContent="space-between"
      css={{ marginBottom: "$8" }}>
      <Row justify="space-between" align="center">
        <Col>
          <Tooltip
            placement="bottom"
            content={"Klik hier voor uitleg over Woordje."}>
            <Button
              auto
              light
              animated={false}
              onClick={(e) => {
                dispatch(setModal("splash"));
              }}
              icon={
                <InfoSquare
                  set="two-tone"
                  primaryColor="var(--nextui-colors-blue500)"
                  size="large"
                />
              }
            />
          </Tooltip>
        </Col>
        <Col css={{ textAlign: "center" }}>
          <Text
            h1
            size={60}
            css={{
              textGradient: "45deg, $blue500 -20%, $pink500 50%",
              lineHeight: "60px",
            }}
            weight="bold">
            Woordje
          </Text>
          {gameType === "vrttaal" ? <Text small>VRT Taal editie</Text> : null}
        </Col>
        <Col>
          <Tooltip
            style={{ float: "right" }}
            placement="bottom"
            content="Klik hier voor je statistieken.">
            <Button
              light
              auto
              animated={false}
              onClick={(e) => {
                dispatch(setModal("statistics"));
              }}
              icon={
                <Chart
                  set="two-tone"
                  primaryColor="var(--nextui-colors-pink500)"
                  size="large"
                />
              }
            />
          </Tooltip>
        </Col>
      </Row>
    </Container>
  );
};

export default Header;
