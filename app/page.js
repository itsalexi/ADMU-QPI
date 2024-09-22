'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Autocomplete from '@mui/joy/Autocomplete';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    PlusCircleIcon,
    MinusCircleIcon,
    BookOpenIcon,
    GraduationCapIcon,
    EditIcon,
} from 'lucide-react';

const gradeToQPI = {
    A: 4.0,
    'B+': 3.5,
    B: 3.0,
    'C+': 2.5,
    C: 2.0,
    D: 1.0,
    F: 0.0,
    W: 0.0,
};

const gradeColors = {
    A: 'bg-green-100 dark:bg-green-900',
    'B+': 'bg-lime-100 dark:bg-lime-900',
    B: 'bg-yellow-100 dark:bg-yellow-900',
    'C+': 'bg-orange-100 dark:bg-orange-900',
    C: 'bg-red-100 dark:bg-red-900',
    D: 'bg-red-200 dark:bg-red-800',
    F: 'bg-red-300 dark:bg-red-700',
    W: 'bg-gray-100 dark:bg-gray-700',
};
const fetchPrograms = async (id = '') => {
    let data = [];
    if (id === '') {
        const response = await fetch('/api/programs');
        data = await response.json();
    } else {
        const response = await fetch(`/api/programs?id=${id}`);
        data = await response.json();
    }
    return data;
};

export default function Home() {
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [gradeData, setGradeData] = useState({});
    const [programList, setProgramList] = useState([]);
    const [editMode, setEditMode] = useState({});
    const [selectedProgramData, setSelectedProgramData] = useState(null);
    const [selectOptions, setOptions] = useState([]);

    const [desiredQPI, setDesiredQPI] = useState(0);
    const [requiredQPI, setRequiredQPI] = useState(0);

    useEffect(() => {
        const fetchProgramList = async () => {
            const list = await fetchPrograms();
            const options = list.map((program) => ({
                label: program.program_info,
                id: program.id,
            }));
            console.log(options);
            setOptions(options);
            setProgramList(list);
        };
        fetchProgramList();
    }, []);

    useEffect(() => {
        if (!selectedProgram) return;
        const fetchProgram = async () => {
            const programInfo = await fetchPrograms(selectedProgram);
            setSelectedProgramData(programInfo[0]);
        };
        fetchProgram();
        setGradeData({});
    }, [selectedProgram]);

    const handleGradeChange = useCallback((catNo, value) => {
        setGradeData((prev) => ({
            ...prev,
            [catNo]: value,
        }));
    }, []);

    const calculateOverallQPI = useCallback(() => {
        if (!selectedProgramData) return '0.00';

        let totalQPI = 0;
        let totalUnits = 0;

        selectedProgramData?.years?.forEach((year) => {
            year.semesters.forEach((semester) => {
                semester.courses.forEach((course) => {
                    const grade = gradeData[course.catNo];
                    if (grade && grade !== 'W') {
                        const qpi = gradeToQPI[grade];
                        const units = parseFloat(course.units);
                        totalQPI += qpi * units;
                        totalUnits += units;
                    }
                });
            });
        });

        return totalUnits > 0 ? (totalQPI / totalUnits).toFixed(2) : '0.00';
    }, [selectedProgramData, gradeData]);

    const calculateRequiredQPI = (
        currentQPI,
        desiredQPI,
        unitsTaken,
        unitsLeft
    ) => {
        const totalUnits = unitsTaken + unitsLeft;
        const totalQPIPointsNeeded = desiredQPI * totalUnits;

        const currentQPIPoints = currentQPI * unitsTaken;

        const additionalQPIPointsNeeded =
            totalQPIPointsNeeded - currentQPIPoints;

        const requiredQPI = additionalQPIPointsNeeded / unitsLeft;

        return requiredQPI;
    };

    const completionPercentage = useMemo(() => {
        if (!selectedProgramData) return 0;
        const totalCourses = selectedProgramData?.years?.reduce(
            (total, year) =>
                total +
                year.semesters.reduce(
                    (semTotal, semester) => semTotal + semester.courses.length,
                    0
                ),
            0
        );
        const completedCourses = Object.values(gradeData).filter(
            (grade) => grade && grade !== 'W'
        ).length;
        return Math.round((completedCourses / totalCourses) * 100);
    }, [selectedProgramData, gradeData]);

    const totalUnitsTaken = useMemo(() => {
        if (!selectedProgramData) return 0;
        let totalUnits = 0;

        selectedProgramData?.years?.forEach((year) => {
            year.semesters.forEach((semester) => {
                semester.courses.forEach((course) => {
                    const grade = gradeData[course.catNo];
                    if (grade && grade !== 'W') {
                        totalUnits += parseFloat(course.units);
                    }
                });
            });
        });

        return totalUnits;
    }, [selectedProgramData, gradeData]);

    const totalUnitsLeft = useMemo(() => {
        if (!selectedProgramData) return 0;
        let totalUnits = 0;

        selectedProgramData?.years?.forEach((year) => {
            year.semesters.forEach((semester) => {
                semester.courses.forEach((course) => {
                    const grade = gradeData[course.catNo];
                    if (!grade || grade === 'W') {
                        totalUnits += parseFloat(course.units);
                    }
                });
            });
        });

        return totalUnits;
    }, [selectedProgramData, gradeData]);

    useEffect(() => {
        setRequiredQPI(
            calculateRequiredQPI(
                calculateOverallQPI(),
                desiredQPI,
                totalUnitsTaken,
                totalUnitsLeft
            )
        );
    }, [calculateOverallQPI, desiredQPI, totalUnitsTaken, totalUnitsLeft]);

    const addCourse = (yearIndex, semesterIndex) => {
        const newCourse = {
            id: Date.now().toString(),
            catNo: `TBD 101`,
            courseTitle: 'Edit me!',
            units: '3',
        };

        setSelectedProgramData((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData));
            newData.years[yearIndex].semesters[semesterIndex].courses.push(
                newCourse
            );
            return newData;
        });
    };

    const removeCourse = (yearIndex, semesterIndex, courseId) => {
        setSelectedProgramData((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData));
            const courses =
                newData.years[yearIndex].semesters[semesterIndex].courses;
            const courseIndex = courses.findIndex(
                (course) => course.catNo === courseId
            );
            if (courseIndex !== -1) {
                courses.splice(courseIndex, 1);
            }
            return newData;
        });
    };

    const toggleEditMode = (courseId) => {
        setEditMode((prev) => ({
            ...prev,
            [courseId]: !prev[courseId],
        }));
    };

    const updateCourse = (yearIndex, semesterIndex, courseId, field, value) => {
        setSelectedProgramData((prevData) => {
            const newData = JSON.parse(JSON.stringify(prevData));
            const course = newData.years[yearIndex].semesters[
                semesterIndex
            ].courses.find((c) => c.catNo === courseId);
            console.log(
                newData.years[yearIndex].semesters[semesterIndex].courses
            );
            console.log(course);
            if (course) {
                course[field] = value;
            }
            return newData;
        });
    };
    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="mb-6">
                <Autocomplete
                    options={selectOptions}
                    onChange={(event, value) => {
                        setSelectedProgram(value ? value.id : null);
                        setGradeData({});
                    }}
                    placeholder="Select a program from the list!"
                    value={
                        programList.find(
                            (program) => program.catNo === selectedProgram
                        ) || null
                    }
                    getOptionLabel={(option) => option.label}
                    getOptionKey={(option) => {
                        console.log(option.id);
                    }}
                />
            </div>

            {selectedProgramData && (
                <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    key={selectedProgram}
                >
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>
                                {selectedProgramData?.program_info}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs
                                defaultValue={
                                    selectedProgramData?.years[0].year
                                }
                            >
                                <TabsList className="w-full justify-start mb-4 overflow-x-auto">
                                    {selectedProgramData?.years?.map(
                                        (year, index) => (
                                            <TabsTrigger
                                                key={index}
                                                value={year.year}
                                                className="flex-shrink-0"
                                            >
                                                {year.year}
                                            </TabsTrigger>
                                        )
                                    )}
                                </TabsList>
                                {selectedProgramData?.years?.map(
                                    (year, yearIndex) => (
                                        <TabsContent
                                            key={yearIndex}
                                            value={year.year}
                                        >
                                            {year.semesters.map(
                                                (semester, semesterIndex) => (
                                                    <div
                                                        key={semesterIndex}
                                                        className="mb-4"
                                                    >
                                                        <h3 className="font-semibold mb-2 flex items-center">
                                                            <GraduationCapIcon className="mr-2" />
                                                            {semester.name}
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {semester.courses.map(
                                                                (course) => (
                                                                    <div
                                                                        key={
                                                                            course.catNo
                                                                        }
                                                                        className="flex items-center space-x-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800"
                                                                    >
                                                                        {editMode[
                                                                            course
                                                                                .catNo
                                                                        ] ? (
                                                                            <>
                                                                                <Input
                                                                                    value={
                                                                                        course.catNo
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) => {
                                                                                        console.log(
                                                                                            yearIndex,
                                                                                            semesterIndex,
                                                                                            course.catNo
                                                                                        );
                                                                                        updateCourse(
                                                                                            yearIndex,
                                                                                            semesterIndex,
                                                                                            course.catNo,
                                                                                            'catNo',
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        );
                                                                                    }}
                                                                                    className="w-1/5"
                                                                                />
                                                                                <Input
                                                                                    value={
                                                                                        course.courseTitle
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        updateCourse(
                                                                                            yearIndex,
                                                                                            semesterIndex,
                                                                                            course.catNo,
                                                                                            'courseTitle',
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    className="w-2/5 max-sm:hidden"
                                                                                />
                                                                                <Input
                                                                                    value={
                                                                                        course.units
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        updateCourse(
                                                                                            yearIndex,
                                                                                            semesterIndex,
                                                                                            course.catNo,
                                                                                            'units',
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    className="w-1/5"
                                                                                    type="number"
                                                                                    min="1"
                                                                                    max="6"
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Label
                                                                                    htmlFor={
                                                                                        course.catNo
                                                                                    }
                                                                                    className="w-1/5 text-sm font-medium"
                                                                                >
                                                                                    {
                                                                                        course.catNo
                                                                                    }
                                                                                </Label>
                                                                                <div className="w-2/5 text-sm max-sm:hidden">
                                                                                    {
                                                                                        course.courseTitle
                                                                                    }
                                                                                </div>
                                                                                <div className="w-1/5 text-sm text-center">
                                                                                    {
                                                                                        course.units
                                                                                    }{' '}
                                                                                    units
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                        <Select
                                                                            onValueChange={(
                                                                                value
                                                                            ) =>
                                                                                handleGradeChange(
                                                                                    course.catNo,
                                                                                    value
                                                                                )
                                                                            }
                                                                            value={
                                                                                gradeData[
                                                                                    course
                                                                                        .catNo
                                                                                ] ||
                                                                                undefined
                                                                            }
                                                                        >
                                                                            <SelectTrigger
                                                                                className={`w-1/5 ${
                                                                                    gradeData[
                                                                                        course
                                                                                            .catNo
                                                                                    ]
                                                                                        ? gradeColors[
                                                                                              gradeData[
                                                                                                  course
                                                                                                      .catNo
                                                                                              ]
                                                                                          ]
                                                                                        : ''
                                                                                }`}
                                                                            >
                                                                                <SelectValue placeholder="N/A" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {gradeData &&
                                                                                    Object.keys(
                                                                                        gradeToQPI
                                                                                    ).map(
                                                                                        (
                                                                                            grade
                                                                                        ) => (
                                                                                            <SelectItem
                                                                                                key={
                                                                                                    grade
                                                                                                }
                                                                                                value={
                                                                                                    grade
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    grade
                                                                                                }
                                                                                            </SelectItem>
                                                                                        )
                                                                                    )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() =>
                                                                                toggleEditMode(
                                                                                    course.catNo
                                                                                )
                                                                            }
                                                                        >
                                                                            <EditIcon className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() =>
                                                                                removeCourse(
                                                                                    yearIndex,
                                                                                    semesterIndex,
                                                                                    course.catNo
                                                                                )
                                                                            }
                                                                        >
                                                                            <MinusCircleIcon className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                addCourse(
                                                                    yearIndex,
                                                                    semesterIndex
                                                                )
                                                            }
                                                            className="mt-2"
                                                        >
                                                            <PlusCircleIcon className="h-4 w-4 mr-2" />
                                                            Add Course
                                                        </Button>
                                                    </div>
                                                )
                                            )}
                                        </TabsContent>
                                    )
                                )}
                            </Tabs>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>QPI Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-center mb-4">
                                    {calculateOverallQPI()}
                                </div>
                                <div className="text-center mb-4">
                                    <p>Total Units Taken: {totalUnitsTaken}</p>
                                    <p>Total Units Left: {totalUnitsLeft}</p>
                                </div>
                                <Progress
                                    value={completionPercentage}
                                    className="w-full"
                                />
                                <div className="text-sm text-center mt-2">
                                    {completionPercentage}% Complete (
                                    {totalUnitsTaken}/
                                    {totalUnitsTaken + totalUnitsLeft})
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Desired QPI Calculator</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="desiredQPI">
                                            Desired QPI
                                        </Label>
                                        <Input
                                            id="desiredQPI"
                                            type="number"
                                            min="0"
                                            max="4"
                                            step="0.01"
                                            value={desiredQPI}
                                            onChange={(e) =>
                                                setDesiredQPI(e.target.value)
                                            }
                                            placeholder="Enter desired QPI"
                                        />
                                    </div>
                                    {requiredQPI > 0 ? (
                                        <div>
                                            <p>
                                                Required QPI for remaining
                                                units: {requiredQPI.toFixed(2)}
                                            </p>
                                            {requiredQPI > 4.0 && (
                                                <p className="text-red-500">
                                                    Note: Achieving this QPI may
                                                    not be possible as it
                                                    requires a QPI higher than
                                                    4.0 for remaining units.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        'Required QPI for remaining units: '
                                    )}
                                    {requiredQPI === 0 && desiredQPI && (
                                        <p>
                                            You&apos;ve already achieved or
                                            exceeded your desired QPI!
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>QPI Scale</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(gradeToQPI).map(
                                        ([grade, qpi]) => (
                                            <div
                                                key={grade}
                                                className={`p-2 rounded-md ${gradeColors[grade]}`}
                                            >
                                                {grade}: {qpi.toFixed(1)}
                                            </div>
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {!selectedProgramData && (
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <BookOpenIcon className="mx-auto h-12 w-12 mb-2" />
                    <p>Select a program to begin calculating your QPI.</p>
                </div>
            )}
        </div>
    );
}
