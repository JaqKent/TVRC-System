import React, { useState, useEffect } from 'react';
import { Form, Col, Button } from 'react-bootstrap';
import Axios from 'axios';

const SearchBox = (props) => {
  const [searchData, setSearchData] = useState({
    name: '',
    address: '',
  });

  const cleanInputs = () => {
    setSearchData({
      name: '',
      address: '',
    });
    props.refresh();
  };

  const handleChange = (e) => {
    let strSearch = Object.values(e.target.value);
    let { name, value } = e.target;
    setSearchData({ ...searchData, [name]: value });
  };

  useEffect(() => {
    // La lógica de búsqueda aquí
    if (searchData.name.length >= 3 || searchData.name.length === 0) {
      Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/players/search`,
        searchData,
        {
          headers: { 'auth-token': localStorage.getItem('token') },
        }
      ).then(({ data }) =>
        props.setResults(
          data.data
            .sort((a, b) => a.name.localeCompare(b.name))
            .filter((element) => element.unSubscribingDate === null)
        )
      );
    }
  }, [searchData]);

  const onSubmit = (e) => {
    e.preventDefault();
    Axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/players/search`,
      searchData,
      {
        headers: { 'auth-token': localStorage.getItem('token') },
      }
    ).then(({ data }) => props.setResults(data.data));
  };

  return (
    <Form onSubmit={onSubmit}>
      <Form.Row className='align-items-center justify-content-between'>
        <Col sm='4'>
          <Form.Control
            type='text'
            name='name'
            value={searchData.name}
            onChange={handleChange}
            placeholder='Nombre'
          />
        </Col>

        <Col sm='4'>
          <Form.Control
            type='text'
            name='category'
            value={searchData.category}
            onChange={handleChange}
            placeholder='Categoria'
          />
        </Col>

        <Col sm='2' className='text-right'>
          <Button variant='primary' type='submit'>
            Buscar
          </Button>
        </Col>

        <Col sm='2' className='text-left'>
          <Button variant='danger' onClick={cleanInputs}>
            Limpiar búsqueda
          </Button>
        </Col>
      </Form.Row>
    </Form>
  );
};

export default SearchBox;
