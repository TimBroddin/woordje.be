import { Container, Row, Col, Button, Text, Tooltip } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import { usePlausible } from "next-plausible";

import { useBrand } from "../lib/hooks";
import InfoSquare from "../lib/iconly/Icons/InfoSquare";
import Chart from "../lib/iconly/Icons/Chart";
import { setModal } from "../redux/features/modal";

const Header = () => {
  const dispatch = useDispatch();
  const { gameType, colorBlind } = useSelector((state) => state.settings);
  const brand = useBrand();

  const plausible = usePlausible();
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
            aria-label={`Klik hier voor uitleg over ${brand.title}`}
            content={`Klik hier voor uitleg over ${brand.title}`}>
            <Button
              auto
              light
              animated={false}
              onClick={(e) => {
                dispatch(setModal("splash"));
              }}
              aria-label="Uitleg"
              icon={
                <InfoSquare
                  set={colorBlind ? "bold" : "two-tone"}
                  primaryColor="var(--color-icon-left)"
                  secondaryColor="var(--nextui-colors-blue500)"
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
              lineHeight: "70px",
            }}
            weight="bold">
            {brand.title}
          </Text>
          {gameType === "vrttaal" ? <Text small>VRT Taal editie</Text> : null}
        </Col>
        <Col>
          <Tooltip
            style={{ float: "right" }}
            placement="bottom"
            aria-label="Klik hier voor je statistieken."
            content="Klik hier voor je statistieken.">
            <Button
              light
              auto
              animated={false}
              aria-label="Statistieken"
              onClick={(e) => {
                plausible("Statistics");

                dispatch(setModal("statistics"));
              }}
              icon={
                <Chart
                  set={colorBlind ? "bold" : "two-tone"}
                  primaryColor="var(--color-icon-right)"
                  secondaryColor="var(--nextui-colors-pink500)"
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
