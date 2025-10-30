// app/tests/page.test.tsx
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '../page'

// Mock the components since they're tested separately
jest.mock('../components/ImageUpload', () => {
  return function MockImageUpload() {
    return <div data-testid="image-upload">ImageUpload Component</div>
  }
})

jest.mock('../components/ChatPanel', () => {
  return function MockChatPanel() {
    return <div data-testid="chat-panel">ChatPanel Component</div>
  }
})

describe('Home Page', () => {
  it('renders both main sections', () => {
    render(<Home />)
    
    expect(screen.getByTestId('image-upload')).toBeInTheDocument()
    expect(screen.getByTestId('chat-panel')).toBeInTheDocument()
  })

  it('uses grid layout', () => {
    const { container } = render(<Home />)
    const gridContainer = container.querySelector('.grid')
    
    expect(gridContainer).toBeInTheDocument()
    expect(gridContainer).toHaveClass('lg:grid-cols-2')
  })
})