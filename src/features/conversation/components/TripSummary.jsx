import React from 'react';
import { Calendar, Users, MapPin, Ship, Wallet } from 'lucide-react';

const TripSummary = ({ summaryData }) => {
    if (!summaryData) {
        return null;
    }

    const {
        trip_summary,
        planning_details,
        itinerary,
        remaining_budget
    } = summaryData;

    return (
        <div className="rounded-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip Summary</h2>
            <p className="text-gray-600 mb-6">{trip_summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Planning Details</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span><strong>From:</strong> {planning_details?.departure_location}</span>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span><strong>To:</strong> {planning_details?.destination_location}</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            <span><strong>Date:</strong> {planning_details?.departure_date} ({planning_details.duration_days} days)</span>
                        </div>
                        <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-500" />
                            <span><strong>People:</strong> {planning_details?.number_of_people}</span>
                        </div>
                        <div className="flex items-center">
                            <Wallet className="w-4 h-4 mr-2 text-gray-500" />
                            <span><strong>Total Budget:</strong> {planning_details?.total_budget}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-700 mb-2">Budget Overview</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                            <Wallet className="w-4 h-4 mr-2 text-green-500" />
                            <span><strong>Total Budget:</strong> {planning_details?.total_budget}</span>
                        </div>
                        <div className="flex items-center">
                            <Wallet className="w-4 h-4 mr-2 text-red-500" />
                            <span><strong>Remaining:</strong> {remaining_budget}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Itinerary</h3>
                <div className="space-y-4">
                    {itinerary.map((item, index) => (
                        <div key={index} className="p-4 rounded-lg border border-gray-200">
                            {item.type === 'fixed_cost' && (
                                <div className="flex items-center">
                                    <Ship className="w-5 h-5 mr-3 text-blue-500" />
                                    <div>
                                        <p className="font-semibold">{item.description}</p>
                                        <p className="text-sm text-gray-600">{item.budget}</p>
                                    </div>
                                </div>
                            )}
                            {item.type === 'daily_plan' && (
                                <div>
                                    <h4 className="font-bold text-gray-700">{item.day} - {item.date}</h4>
                                    <ul className="list-disc list-inside mt-2 ml-4 text-sm text-gray-600 space-y-1">
                                        {item.activities.map((activity, i) => (
                                            <li key={i}>{activity}</li>
                                        ))}
                                    </ul>
                                    <p className="text-sm text-gray-500 mt-2"><strong>Budget:</strong> {item.budget}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TripSummary;