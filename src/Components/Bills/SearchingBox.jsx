import React, { useState } from 'react';
import {
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  Accordion,
  Card,
} from 'react-bootstrap';
import Axios from 'axios';

const SearchingBox = (props) => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();

    Axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/bills/search`,
      { dateFrom, dateTo },
      {
        headers: { 'auth-token': localStorage.getItem('token') },
      }
    )
      .then(({ data }) => props.setResults(data.data))
      .catch((err) => alert(err.message));
  };

  const clean = () => {
    setDateFrom('');
    setDateTo('');
    props.refresh();
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'dateFrom') {
      setDateFrom(value);
    } else if (name === 'dateTo') {
      setDateTo(value);
    }
  };

  return (
    <Row className='bg-light shadow rounded mt-3'>
      <Col className='p-3'>
        <Accordion>
          <Card>
            <Accordion.Toggle
              as={Card.Header}
              style={{ cursor: 'pointer' }}
              eventKey='0'
            >
              <p className='lead m-0 p-0'>Búsqueda</p>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey='0'>
              <Form onSubmit={onSubmit}>
                <Card.Body>
                  <Row>
                    <Form.Group as={Col}>
                      <InputGroup>
                        <InputGroup.Prepend>
                          <InputGroup.Text>Desde</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          type='date'
                          name='dateFrom'
                          value={dateFrom}
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group as={Col}>
                      <InputGroup>
                        <InputGroup.Prepend>
                          <InputGroup.Text>Hasta</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          type='date'
                          name='dateTo'
                          value={dateTo}
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Row>
                  <Row>
                    <Col className='text-right'>
                      <Button type='submit'>Buscar</Button>
                      <Button
                        onClick={clean}
                        className='ml-3'
                        variant='secondary'
                      >
                        Limpiar
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Form>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </Col>
    </Row>
  );
};

export default SearchingBox;
