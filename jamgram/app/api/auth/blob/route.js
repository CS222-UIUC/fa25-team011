// import the `put` function to upload files to Blob storage.
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// defining a POST endpoint
export async function POST(request) {

  const data = await request.formData();

  // the form field must be named 'file'
  const file = data.get('file');

  // error if no valid file
  if (!file) {
    return NextResponse.json(
      { error: 'No file uploaded' },
      { status: 400 }
    );
  }

  // put the file in blob storage
  const blob = await put(file.name, file, {
    access: 'public',
  });

  // return metadata
  return NextResponse.json({
    url: blob.url,         
    pathname: blob.pathname,  
    size: blob.size,         
    uploadedAt: new Date(), 
  });
}
