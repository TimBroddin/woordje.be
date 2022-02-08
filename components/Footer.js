import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styled from "styled-components";
import { useGameState } from "../lib/hooks";
import { usePlausible } from "next-plausible";
import { useSelector, useDispatch } from "react-redux";
import { setColorBlind } from "../redux/features/settings";
import { getRandomWord } from "../redux/features/randomWord";
import { show as showSplash } from "../redux/features/splash";
import { ButtonRow } from "./styled";
import {
  Button,
  Card,
  Grid,
  Text,
  Container,
  Row,
  Tooltip,
} from "@nextui-org/react";

const Wrapper = styled.footer``;

const Random = styled.div`
  cursor: pointer;
  font-size: 16px;
  padding: 5px;
  margin-top: 5px;
  display: inline-block;
  font-family: Courier;
`;

const Levels = styled.div`
  margin: 24px 0;
`;

const Level = styled.a`
  font-size: 16px;
  background-color: ${(props) =>
    props.$current
      ? "var(--nextui-colors-primaryDark)"
      : "var(--nextui-colors-primaryLight)"};
  color: white;
  text-decoration: none !important;
  margin: 0 5px 5px 0;
  border-radius: var(--nextui-radii-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
`;

const Footer = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const randomWord = useSelector((state) => state.randomWord);
  const colorBlind = useSelector((state) => state.settings?.colorBlind);
  const { WORD_LENGTH } = useSelector((state) => state.settings);
  const plausible = usePlausible();

  return (
    <Wrapper>
      <Grid.Container gap={1}>
        <Grid xs={12} sm={6}>
          <Card>
            <Card.Body>
              <Text b>Level</Text>

              <Levels>
                {[3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <Link
                    href={`/speel/${level}`}
                    key={`level-${level}`}
                    passHref>
                    <Level $current={WORD_LENGTH === level}>{level}</Level>
                  </Link>
                ))}
              </Levels>
            </Card.Body>
          </Card>
        </Grid>
        <Grid xs={12} sm={6}>
          <Container gap={0}>
            <Row>
              <Card
                clickable
                css={{ marginBottom: "$8" }}
                onClick={(e) => dispatch(getRandomWord())}>
                <Card.Header>
                  <Text b>Willekeurig woord</Text>
                </Card.Header>
                <Card.Body>
                  <Text>{randomWord.value}</Text>
                </Card.Body>
              </Card>
            </Row>
            <Row>
              <Card>
                <Card.Header>
                  <Text b>Instellingen</Text>
                </Card.Header>
                <Card.Body>
                  <Tooltip content={"Hoog contrast voor kleurenblinden."}>
                    <Button
                      auto
                      bordered={colorBlind ? false : true}
                      onClick={(e) => dispatch(setColorBlind(!colorBlind))}>
                      Hoog contrast
                    </Button>
                  </Tooltip>
                </Card.Body>
              </Card>
            </Row>
          </Container>
        </Grid>
        <Grid xs={12}>
          <Card color="gradient" bordered>
            <Card.Header>
              <Text b css={{ fontWeight: "$bold", color: "$white" }}>
                🤵 Over
              </Text>
            </Card.Header>
            <Card.Body>
              <Text css={{ fontWeight: "$bold", color: "$white" }}>
                Deze Vlaamse versie van Wordle werd gemaakt door{" "}
                <a
                  href="https://www.scam.city/"
                  rel="noreferrer"
                  style={{ textDecoration: "underline" }}
                  target="_blank">
                  ScamCity
                </a>
                /
                <a
                  href="https://broddin.be/"
                  style={{ textDecoration: "underline" }}
                  rel="noreferrer"
                  target="_blank">
                  Tim&nbsp;Broddin
                </a>
                .
              </Text>
              <Text css={{ fontWeight: "$bold", color: "$white" }}>
                Gebaseerd op{" "}
                <a
                  href="https://www.powerlanguage.co.uk/wordle/"
                  rel="noreferrer"
                  target="_blank">
                  Wordle
                </a>{" "}
                en{" "}
                <a
                  href="https://github.com/rauchg/wordledge"
                  rel="noreferrer"
                  target="_blank">
                  Wordledge
                </a>
                .
              </Text>
            </Card.Body>
          </Card>
        </Grid>
      </Grid.Container>
    </Wrapper>
  );
};

export default Footer;
