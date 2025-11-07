// app/components/ImageUpload.test.tsx
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ImageUpload from "../components/ImageUpload"

describe('ImageUpload Component', () => {
  it('renders the upload section', () => {
    render(<ImageUpload />)
    expect(screen.getByText('Upload Your Image')).toBeInTheDocument()
  })

  it('displays the drag and drop instruction', () => {
    render(<ImageUpload />)
    expect(screen.getByText(/Drag & drop an image here/i)).toBeInTheDocument()
  })

  it('shows file input button', () => {
    render(<ImageUpload />)
    expect(screen.getByLabelText('Select Image')).toBeInTheDocument()
  })

  it('displays accepted file types', () => {
    render(<ImageUpload />)
    expect(screen.getByText('PNG, JPG, JPEG')).toBeInTheDocument()
  })

  it('handles file selection and shows preview', () => {
    render(<ImageUpload />)
    
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText('Select Image') as HTMLInputElement

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByAltText('Preview')).toBeInTheDocument()
    expect(screen.getByText('Remove Image')).toBeInTheDocument()
  })

  it('removes image when remove button is clicked', () => {
    render(<ImageUpload />)
    
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText('Select Image') as HTMLInputElement

    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    
    // Upload image
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByAltText('Preview')).toBeInTheDocument()
    
    // Remove image
    const removeButton = screen.getByText('Remove Image')
    fireEvent.click(removeButton)
    
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
    expect(screen.getByText('Select Image')).toBeInTheDocument()
  })
})
