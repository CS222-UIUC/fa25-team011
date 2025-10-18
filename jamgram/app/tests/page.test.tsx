import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '../page'

describe('Home Page', () => {
  it('renders the image upload section', () => {
    render(<Home />)
    
    const imageUploadHeading = screen.getByText('Image Upload')
    expect(imageUploadHeading).toBeInTheDocument()
  })

  it('renders the chat section', () => {
    render(<Home />)
    
    const chatHeading = screen.getByText('Chat')
    expect(chatHeading).toBeInTheDocument()
  })

  it('displays the image upload description', () => {
    render(<Home />)
    
    const description = screen.getByText(/Add a picture to get the perfect track/i)
    expect(description).toBeInTheDocument()
  })

  it('displays the chat description', () => {
    render(<Home />)
    
    const description = screen.getByText(/Tailor and\/or tweak recommendations/i)
    expect(description).toBeInTheDocument()
  })
})