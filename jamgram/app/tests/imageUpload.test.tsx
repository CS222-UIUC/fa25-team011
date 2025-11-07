// app/components/ImageUpload.test.tsx
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ImageUpload from "../components/ImageUpload"

beforeEach(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = jest.fn()
})

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
    expect(screen.getByText('PNG, JPG, JPEG, HEIC')).toBeInTheDocument()
  })

  it('handles file selection and shows preview', () => {
    render(<ImageUpload />)
    
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText('Select Image') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByAltText('Preview')).toBeInTheDocument()
    expect(screen.getByText('Remove Image')).toBeInTheDocument()
  })

  it('removes image when remove button is clicked', () => {
    render(<ImageUpload />)
    
    const file = new File(['test'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText('Select Image') as HTMLInputElement

    // Upload image
    fireEvent.change(input, { target: { files: [file] } })
    expect(screen.getByAltText('Preview')).toBeInTheDocument()
    
    // Remove image
    const removeButton = screen.getByText('Remove Image')
    fireEvent.click(removeButton)
    
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument()
    expect(screen.getByText('Select Image')).toBeInTheDocument()
  })

  it('converts HEIC files before previewing', async () => {
    const mockBitmap = {
      width: 100,
      height: 100,
      close: jest.fn(),
    } as unknown as ImageBitmap

    const originalCreateImageBitmap = globalThis.createImageBitmap
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    const originalToBlob = HTMLCanvasElement.prototype.toBlob

    const drawImage = jest.fn()

    ;(globalThis as any).createImageBitmap = jest.fn(() => Promise.resolve(mockBitmap))
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({ drawImage })) as any
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
      callback(new Blob(['converted'], { type: 'image/jpeg' }))
    }) as any

    render(<ImageUpload />)

    const file = new File(['test'], 'test.heic', { type: 'image/heic' })
    const input = screen.getByLabelText('Select Image') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByText('Converting HEIC image…')).toBeInTheDocument()
    expect(await screen.findByAltText('Preview')).toBeInTheDocument()

    expect(globalThis.createImageBitmap).toHaveBeenCalledWith(file)
    expect(drawImage).toHaveBeenCalled()

    if (originalCreateImageBitmap) {
      ;(globalThis as any).createImageBitmap = originalCreateImageBitmap
    } else {
      delete (globalThis as any).createImageBitmap
    }
    HTMLCanvasElement.prototype.getContext = originalGetContext
    HTMLCanvasElement.prototype.toBlob = originalToBlob
  })
})
