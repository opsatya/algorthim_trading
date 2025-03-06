import React from 'react'
import styled from 'styled-components'

const Section = styled.section`
  width: 100%;
  min-height: 60vh;
  background-color: ${({ theme }) => theme.body};
  padding: 4rem 1rem;
  font-family: Arial, sans-serif;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`

const Grid = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 2fr;
  }
`

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  margin-top:1rem;
  margin-left:1px;
  padding-right: 10rem;
`

const Number = styled.span`
  font-size: 0.875rem;
  font-weight: 300;
`

const Vision = styled.span`
  font-size: 0.875rem;
  text-transform: uppercase;
`

const ContentColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const Heading = styled.h1`
  font-size: 2.5rem;
  font-weight: 400;
  line-height: 1.2;
  
  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
  
  @media (min-width: 1024px) {
    font-size: 4rem;
  }
`

const Paragraph = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.isDark ? '#666' : theme.text};
  line-height: 1.6;
  max-width: 100%;
  
  @media (min-width: 768px) {
    font-size: 1.125rem;
    max-width: 80%;
  }
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  color: ${({ theme }) => theme.text};
`

const VisionText = styled.p`
  font-size: 2.5rem;
  font-weight: 400;
  line-height: 1.2;
  color: ${({ theme }) => theme.text};
`

const VisionLink = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.text};
    
  &:hover {
    opacity: 0.8;
  }
`

const VisionSection = ()=> {
  return (
    <Section id='vision'>
      <Grid>
        <TopRow>
          <Number>— 01</Number>
          <Vision>(OUR VISION)</Vision>
        </TopRow>
        <ContentColumn>
          <Heading>Transforming trading through algorithmic intelligence.</Heading>
          <Paragraph>
            Cancerian Capital was born from a revolutionary concept: making algorithmic trading accessible to everyone. We wanted to eliminate the barriers between sophisticated trading strategies and individual investors, forming meaningful connections with our clients and empowering them to navigate markets with confidence and precision.
          </Paragraph>
          <VisionLink href="#">Discover our trading philosophy</VisionLink>
        </ContentColumn>
      </Grid>
    </Section>
  )
}

export default VisionSection;