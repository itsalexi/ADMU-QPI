// app/api/programs/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        const jsonPath = path.join(process.cwd(), 'data', 'programs.json');
        const fileContents = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(fileContents);

        if (id) {
            const programData = data[id];
            if (!programData) {
                return NextResponse.json(
                    { error: 'Program not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json(programData);
        } else {
            const allPrograms = Object.entries(data).map(
                ([id, programData]) => ({
                    id,
                    program_info: programData[0].program_info,
                })
            );
            return NextResponse.json(allPrograms);
        }
    } catch (error) {
        console.error('Error reading program data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch program data' },
            { status: 500 }
        );
    }
}
