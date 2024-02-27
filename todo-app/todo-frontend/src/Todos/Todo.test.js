import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Todo from './Todo';

test('renders todo and can complete and delete', () => {
  const todo = { id: 1, text: 'Test Todo', done: false };
  const deleteTodo = jest.fn();
  const completeTodo = jest.fn();
  render(<Todo todo={todo} deleteTodo={deleteTodo} completeTodo={completeTodo} />);
  
  const deleteButton = screen.getByText('Delete');
  const completeButton = screen.getByText('Set as done');
  
  fireEvent.click(deleteButton);
  expect(deleteTodo).toHaveBeenCalledWith(todo);
  
  fireEvent.click(completeButton);
  expect(completeTodo).toHaveBeenCalledWith(todo);
});
