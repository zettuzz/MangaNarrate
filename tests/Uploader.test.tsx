import { render, screen } from "@testing-library/react"
import { Uploader } from "@/components/Uploader"
import "@testing-library/jest-dom"
import jest from "jest" // Declare the jest variable

// Mock the store
jest.mock("@/store/useStore", () => ({
  useStore: () => ({
    images: [],
    addImages: jest.fn(),
    removeImage: jest.fn(),
    reorderImages: jest.fn(),
    clearImages: jest.fn(),
  }),
}))

describe("Uploader Component", () => {
  it("renders upload area with correct text", () => {
    render(<Uploader />)

    expect(screen.getByText("Drag & drop images here, or click to select")).toBeInTheDocument()
    expect(screen.getByText("Max 4MB per image, up to 100 images")).toBeInTheDocument()
  })

  it("shows upload icon", () => {
    render(<Uploader />)

    const uploadIcon = document.querySelector("svg")
    expect(uploadIcon).toBeInTheDocument()
  })
})
