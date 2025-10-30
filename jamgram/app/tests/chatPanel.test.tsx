// app/components/ChatPanel.test.tsx
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChatPanel from '../components/ChatPanel'

describe('ChatPanel Component', () => {
  it('renders the chat header', () => {
    render(<ChatPanel />)
    expect(screen.getByText('Chat')).toBeInTheDocument()
  })

  it('displays the instruction text', () => {
    render(<ChatPanel />)
    expect(screen.getByText(/Tailor and\/or tweak recommendations/i)).toBeInTheDocument()
  })

  it('shows empty state message', () => {
    render(<ChatPanel />)
    expect(screen.getByText(/Start the conversation with an image upload/i)).toBeInTheDocument()
  })

  it('displays spotify connection notice when not connected', () => {
    render(<ChatPanel isConnected={false} />)
    expect(screen.getByText(/Connect Spotify to personalize recommendations/i)).toBeInTheDocument()
  })

  it('does not display spotify notice when connected', () => {
    render(<ChatPanel isConnected={true} />)
    expect(screen.queryByText(/Connect Spotify to personalize recommendations/i)).not.toBeInTheDocument()
  })

  it('renders textarea with placeholder', () => {
    render(<ChatPanel />)
    expect(screen.getByPlaceholderText('Type a message…')).toBeInTheDocument()
  })

  it('renders send button', () => {
    render(<ChatPanel />)
    expect(screen.getByLabelText('Send message')).toBeInTheDocument()
  })

  it('disables send button when input is empty', () => {
    render(<ChatPanel />)
    const sendButton = screen.getByLabelText('Send message')
    expect(sendButton).toBeDisabled()
  })

  it('enables send button when input has text', () => {
    render(<ChatPanel />)
    const textarea = screen.getByPlaceholderText('Type a message…')
    const sendButton = screen.getByLabelText('Send message')
    
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    
    expect(sendButton).not.toBeDisabled()
  })

  it('clears input after sending message', async () => {
    const mockOnSend = jest.fn()
    render(<ChatPanel onSend={mockOnSend} />)
    
    const textarea = screen.getByPlaceholderText('Type a message…') as HTMLTextAreaElement
    const sendButton = screen.getByLabelText('Send message')
    
    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(textarea.value).toBe('')
    })
  })

  it('calls onSend with message text', async () => {
    const mockOnSend = jest.fn()
    render(<ChatPanel onSend={mockOnSend} />)
    
    const textarea = screen.getByPlaceholderText('Type a message…')
    const sendButton = screen.getByLabelText('Send message')
    
    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith('Test message')
    })
  })

  it('sends message on Enter key press', async () => {
    const mockOnSend = jest.fn()
    render(<ChatPanel onSend={mockOnSend} />)
    
    const textarea = screen.getByPlaceholderText('Type a message…')
    
    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })
    
    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith('Test message')
    })
  })

  it('does not send message on Shift+Enter', () => {
    const mockOnSend = jest.fn()
    render(<ChatPanel onSend={mockOnSend} />)
    
    const textarea = screen.getByPlaceholderText('Type a message…')
    
    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })
    
    expect(mockOnSend).not.toHaveBeenCalled()
  })
})