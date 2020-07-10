import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Category = ({ name, description, pictureUrl }) => {
  const Container = styled.div`
    display: flex;
    width: 100%;
    box-sizing: border-box;
    margin: 10px;

    a {
      display: block;
      box-sizing: border-box;
      width: 33%;
      max-width: 13rem;
      height: 5.5rem;
      background-color: #1b3371;
      background-position: 50% 40%;
      border-radius: var(--border-radius);
      margin-right: 1.25rem;
      margin-bottom: 1.25rem;
      font-size: 1.125rem;
      font-weight: bold;
      color: #fff;
      line-height: 5.5rem;
      text-align: center;
      text-decoration: none;
      text-transform: capitalize;
      background-image: url(${pictureUrl});

      &:hover {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        transform: scale(1.0525);
        transition: transform ease 0.125s;
      }
    }

    @media (max-width: 500px) {
      flex-wrap: wrap;

      a {
        width: calc(50% - 1.25rem);

        &:nth-child(2n) {
          margin-right: 0;
        }
      }
    }
  `

  return (
    <Container>
      <Link key={name} to={`/list/${name}`}>
        {name}
      </Link>
    </Container>
  )
}

export default Category