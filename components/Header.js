import { Container, Row, Col, Button, Text, Tooltip } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { usePlausible } from "next-plausible";

import { useTranslations } from "@/lib/i18n";
import InfoSquare from "@/lib/iconly/Icons/InfoSquare";
import Chart from "@/lib/iconly/Icons/Chart";
import Home from "@/lib/iconly/Icons/Home";

import { setModal } from "@/redux/features/modal";

const Header = ({
  showInfo = true,
  showStats = true,
  showHome = false,
  emptyRight = false,
  customTitle,
  titleSize = 60,
  titleColor,
  subtitle,
}) => {
  const dispatch = useDispatch();
  const { gameType, colorBlind } = useSelector((state) => state.settings);
  const translations = useTranslations();
  const router = useRouter();

  const plausible = usePlausible();
  return (
    <Container
      justify="space-between"
      alignItems="center"
      alignContent="space-between"
      css={{ marginBottom: "$8" }}>
      <Row justify="space-between" align="center">
        {showHome && (
          <Col span={2}>
            <Button
              auto
              light
              animated={false}
              onClick={(e) => {
                router.push("/");
              }}
              aria-label="Home"
              icon={
                <Home
                  set={colorBlind ? "bold" : "two-tone"}
                  primaryColor="var(--color-icon-left)"
                  secondaryColor="var(--nextui-colors-blue500)"
                  size="large"
                />
              }
            />
          </Col>
        )}
        {showInfo && (
          <Col span={2}>
            <Tooltip
              placement="bottom"
              aria-label={`Klik hier voor uitleg over ${translations.title}`}
              content={`Klik hier voor uitleg over ${translations.title}`}>
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
        )}
        <Col span={8} css={{ textAlign: "center" }}>
          <Text
            h1
            size={titleSize ?? 55}
            css={{
              textGradient: titleColor ?? "45deg, $blue500 -20%, $pink500 50%",
              lineHeight: "70px",
            }}
            weight="bold">
            {customTitle ? customTitle : translations.title}
          </Text>
          {subtitle && <Text small>{subtitle}</Text>}
        </Col>
        {showStats && (
          <Col span={2}>
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
        )}
        {emptyRight && <Col span={2} />}
      </Row>
    </Container>
  );
};

export default Header;
