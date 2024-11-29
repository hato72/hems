'use client'

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'; // rechartsからインポート
import { useEffect, useState } from 'react';
import { Title } from "@tremor/react";

interface ApplianceData {
  id: string
  name: string
  power: number
  cost: number
}

interface Props {
  data: ApplianceData[]
  totalPower: number
  totalCost: number
  onAlertTriggered: (appliances: ApplianceData[]) => void
  difyResponse: string | null
  showZeroPowerAlert: boolean;
}

export function EnergyDashboard({ data, totalPower, totalCost, onAlertTriggered, difyResponse,showZeroPowerAlert }: Props) {
  const targetCost = 445 // 一日の目標コスト
  const [alertSent, setAlertSent] = useState(false)
  const showAlert = totalCost > targetCost

  useEffect(() => {
    if (showAlert && !alertSent) {
      onAlertTriggered(data)
      setAlertSent(true)
    }
  }, [showAlert, data, onAlertTriggered, alertSent])

  const costData = [
    { name: '合計金額 目標金額', 合計金額: totalCost, 目標金額: targetCost },
  ]

  const powerData = data.map(appliance => ({
    name: appliance.name,
    value: appliance.power
  }))

  const costByApplianceData = data.map(appliance => ({
    name: appliance.name,
    value: appliance.cost
  }))

  return (
    <div className="min-h-screen bg-[#e8f5e8]">
      <div className="bg-green-500 p-4">
        <h1 className="text-2xl font-bold text-center text-white">へらでんくん</h1>
      </div >
      
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-center font-bold text-lg">
              現在の合計金額: {totalCost.toFixed(2)}円
            </div>
            {showAlert && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription >
                  警告！目標金額を超えています！
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div>
            <div className="mb-2 text-center font-bold text-lg">
              現在の合計消費電力: {totalPower.toFixed(6)}W
            </div>
            {showZeroPowerAlert && (
              <Alert className="bg-yellow-100 border-yellow-500 text-yellow-800">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  注意！消費電力の状態が30秒以上続いています！
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-4">
            <Title className="text-sm font-medium mb-2">合計金額と目標金額</Title>
             <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="合計金額" fill="green" name="合計金額"/> {/* dataKeyで値を指定、fillで色を指定 */}
                <Bar dataKey="目標金額" fill="red" name="目標金額"/> 
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4">
            <Title className="text-sm font-medium mb-2">各家電の消費電力（毎秒）</Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={powerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="blue" name="消費電力" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-4">
            <Title className="text-sm font-medium mb-2">各家電の電気料金</Title>
             <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costByApplianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="green" name="電気料金" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4 flex flex-col justify-center space-y-4">
            <Title className="text-sm font-medium mb-2">節約の提案</Title>
            <ResponsiveContainer width="100%" height={300}>
            {difyResponse ? (
              <>
                <p className="text-sm text-gray-600">{difyResponse}</p>
              </>
            ) : (
              <></>
            )}
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  )
}