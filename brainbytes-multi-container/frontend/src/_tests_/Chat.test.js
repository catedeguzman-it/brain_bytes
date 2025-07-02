import {render, screen} from '@testing-library/react';
import Chat from '../../components/ChatInterface';

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ messages: [] })
  })
);

describe('Chat Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders chat interface', () => {
    render(<Chat />);
    expect(screen.getByText(/Brainbytes AI Tutor/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type your message here.../i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });
  });

