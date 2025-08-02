"use client";

import React, {useCallback, useEffect, useState} from "react";
import {createAnswer, getAnswers} from "../../services/QAService";
import {Answer} from "../../types/qa.types";
import {MessageCircle} from "lucide-react";
import AnswerItem from "./AnswerItem";
import {useSelector} from "react-redux";
import {RootState} from "../../store";

interface AnswerListProps {
    questionId: string;
    questionAnswerCount?: number;
}

const AnswerList: React.FC<AnswerListProps>= ({questionId, questionAnswerCount}) => {
    const [answersLoading, setAnswersLoading] = useState(true);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);

    const fetchAnswers = useCallback(async () => {
        try {
            setAnswersLoading(true);
            const response = await getAnswers(questionId, user?.id || "");
            setAnswers(response.data);
        } catch (error) {
            console.error('Error fetching answers:', error);
        } finally {
            setAnswersLoading(false);
        }
    }, [questionId]);

    useEffect(() => {
        fetchAnswers();
    }, []);

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                {questionAnswerCount ?? 0} Câu trả lời
            </h2>
            {answersLoading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Đang tải câu trả lời...</p>
                </div>
            ) : answers.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Chưa có câu trả lời nào
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Hãy là người đầu tiên trả lời câu hỏi này
                    </p>
                </div>
            ) : (
                <div className="">
                    {answers.map((answer) => (
                        <AnswerItem
                            key={answer.id}
                            answer={answer}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default React.memo(AnswerList)